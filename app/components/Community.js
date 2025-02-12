"use client"
import React, { useState, useEffect, useCallback } from "react";
import { 
  Users, 
  PlusCircle, 
  MapPin,
  Calendar,
  Clock,
  UserPlus, 
  Check,
  Map
} from "lucide-react";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  doc, 
  serverTimestamp,
  Timestamp 
} from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";

export const CommunityTripPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [trips, setTrips] = useState([]);
  const [userTrips, setUserTrips] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTrip, setNewTrip] = useState({
    name: '',
    location: '',
    date: new Date(),
    time: '',
    maxParticipants: '',
    description: '',
    cost: '',
    meetingPoint: ''
  });

  const fetchTrips = useCallback(async () => {
    try {
      const tripsRef = collection(db, "communities");
      const snapshot = await getDocs(tripsRef);
      const fetchedTrips = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date() // Convert Timestamp to Date
      }));
      
      setTrips(fetchedTrips);

      const userJoinedTrips = fetchedTrips.filter(
        trip => trip.participants?.includes(user?.uid || '')
      );
      setUserTrips(userJoinedTrips);
    } catch (error) {
      toast({
        title: "Error fetching trips",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [user, toast]);

  const createTrip = async () => {
    if (!user) return;

    try {
      // Convert the date to a Firestore Timestamp
      const tripData = {
        ...newTrip,
        date: Timestamp.fromDate(newTrip.date), // Convert Date to Timestamp
        participants: [user.uid],
        organizer: user.uid,
        createdAt: serverTimestamp(),
        status: 'upcoming'
      };

      const tripRef = await addDoc(collection(db, "communities"), tripData);

      toast({
        title: "Trip Created",
        description: `${newTrip.name} has been created!`,
      });

      setIsCreateModalOpen(false);
      setNewTrip({
        name: '',
        location: '',
        date: new Date(),
        time: '',
        maxParticipants: '',
        description: '',
        cost: '',
        meetingPoint: ''
      });
      fetchTrips();
    } catch (error) {
      toast({
        title: "Error creating trip",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDateSelect = (date) => {
    setNewTrip(prev => ({
      ...prev,
      date: date
    }));
  };



  const joinTrip = async (tripId) => {
    if (!user) return;

    try {
      const tripRef = doc(db, "communities", tripId);
      const trip = trips.find(t => t.id === tripId);

      if (trip && !trip.participants?.includes(user.uid)) {
        if (trip.participants?.length >= parseInt(trip.maxParticipants)) {
          toast({
            title: "Trip is full",
            description: "Maximum number of participants reached",
            variant: "destructive"
          });
          return;
        }

        await updateDoc(tripRef, {
          participants: [...(trip.participants || []), user.uid]
        });

        toast({
          title: "Joined Trip",
          description: `You've joined ${trip.name}`,
        });

        fetchTrips();
      }
    } catch (error) {
      toast({
        title: "Error joining trip",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchTrips();
    }
  }, [user, fetchTrips]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Map className="h-6 w-6" /> Community Trips
        </h1>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-5 w-5" /> Create Trip
        </Button>
      </div>

      <Tabs defaultValue="discover" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none">
          <TabsTrigger value="discover" className="flex gap-2">
            <Map className="h-4 w-4" /> Discover Trips
          </TabsTrigger>
          <TabsTrigger value="joined" className="flex gap-2">
            <Users className="h-4 w-4" /> My Trips
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map(trip => (
              <TripCard 
                key={trip.id}
                trip={trip} 
                onJoin={() => joinTrip(trip.id)} 
                isJoined={trip.participants?.includes(user?.uid || '')}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="joined" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userTrips.map(trip => (
              <TripCard 
                key={trip.id} 
                trip={trip} 
                onJoin={() => {}} 
                isJoined={true}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen}
      >
        <DialogContent className="w-full p-4 bg-white">
          <DialogHeader>
            <DialogTitle>Create a New Trip</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input 
              placeholder="Trip Name"
              value={newTrip.name}
              onChange={(e) => setNewTrip(prev => ({
                ...prev, 
                name: e.target.value
              }))}
            />
            <Input 
              placeholder="Location"
              value={newTrip.location}
              onChange={(e) => setNewTrip(prev => ({
                ...prev, 
                location: e.target.value
              }))}
            />
            <div className="flex flex-row gap-2">
              <CalendarComponent
                mode="single"
                selected={newTrip.date}
                onSelect={handleDateSelect}
                className="rounded-md border w-fit"
                disabled={(date) => date < new Date()}
              />
              <Input 
                type="time"
                value={newTrip.time}
                onChange={(e) => setNewTrip(prev => ({
                  ...prev, 
                  time: e.target.value
                }))}
              />
            </div>
            <Input 
              type="number"
              placeholder="Maximum Participants"
              value={newTrip.maxParticipants}
              onChange={(e) => setNewTrip(prev => ({
                ...prev, 
                maxParticipants: e.target.value
              }))}
            />
            <Input 
              placeholder="Cost (optional)"
              value={newTrip.cost}
              onChange={(e) => setNewTrip(prev => ({
                ...prev, 
                cost: e.target.value
              }))}
            />
            <Input 
              placeholder="Meeting Point"
              value={newTrip.meetingPoint}
              onChange={(e) => setNewTrip(prev => ({
                ...prev, 
                meetingPoint: e.target.value
              }))}
            />
            <Textarea 
              placeholder="Trip Description"
              value={newTrip.description}
              onChange={(e) => setNewTrip(prev => ({
                ...prev, 
                description: e.target.value
              }))}
            />
            <Button 
              onClick={createTrip} 
              className="w-full"
            >
              Create Trip
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
const TripCard = ({ trip, onJoin, isJoined }) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border min-w-fit">
      <div className="flex items-center gap-4 mb-4">
        <Avatar>
          <AvatarFallback>
            {trip.name[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-bold">{trip.name}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            {trip.location}
          </div>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <p className="text-sm text-gray-600">
          {trip.description}
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          {format(trip.date, 'PPP')}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          {trip.time}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users className="h-4 w-4" />
          {trip.participants?.length || 0} / {trip.maxParticipants} participants
        </div>
        {trip.cost && (
          <p className="text-sm text-gray-500">
            Cost: {trip.cost}
          </p>
        )}
        <p className="text-sm text-gray-500">
          Meeting Point: {trip.meetingPoint}
        </p>
      </div>
      <Button 
        onClick={onJoin}
        disabled={isJoined || (trip.participants?.length >= parseInt(trip.maxParticipants))}
        className="w-full"
        variant={isJoined ? "outline" : "default"}
      >
        {isJoined ? (
          <>
            <Check className="h-4 w-4 mr-2" /> Joined
          </>
        ) : trip.participants?.length >= parseInt(trip.maxParticipants) ? (
          "Trip Full"
        ) : (
          <>
            <UserPlus className="h-4 w-4 mr-2" /> Join Trip
          </>
        )}
      </Button>
    </div>
  );
};