"use client"
import React, { useState, useEffect, useCallback } from "react";
import { 
  Users, 
  PlusCircle, 
  Search, 
  Globe, 
  UserPlus, 
  Check 
} from "lucide-react";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

export const CommunityPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [communities, setCommunities] = useState([]);
  const [userCommunities, setUserCommunities] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: ''
  });

  const fetchCommunities = useCallback(async () => {
    try {
      const communitiesRef = collection(db, "communities");
      const snapshot = await getDocs(communitiesRef);
      const fetchedCommunities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCommunities(fetchedCommunities);

      const userJoinedCommunities = fetchedCommunities.filter(
        community => community.members.includes(user?.uid || '')
      );
      setUserCommunities(userJoinedCommunities);
    } catch (error) {
      toast({
        title: "Error fetching communities",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [user, toast]);

  const createCommunity = async () => {
    if (!user) return;

    try {
      const communityRef = await addDoc(collection(db, "communities"), {
        ...newCommunity,
        members: [user.uid],
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });

      toast({
        title: "Community Created",
        description: `${newCommunity.name} has been created!`,
      });

      setIsCreateModalOpen(false);
      setNewCommunity({ name: '', description: '' });
      fetchCommunities();
    } catch (error) {
      toast({
        title: "Error creating community",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const joinCommunity = async (communityId) => {
    if (!user) return;

    try {
      const communityRef = doc(db, "communities", communityId);
      const community = communities.find(c => c.id === communityId);

      if (community && !community.members.includes(user.uid)) {
        await updateDoc(communityRef, {
          members: [...community.members, user.uid]
        });

        toast({
          title: "Joined Community",
          description: `You've joined ${community.name}`,
        });

        fetchCommunities();
      }
    } catch (error) {
      toast({
        title: "Error joining community",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchCommunities();
    }
  }, [user, fetchCommunities]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" /> Communities
        </h1>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-5 w-5" /> Create Community
        </Button>
      </div>

      <Tabs defaultValue="discover" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none">
          <TabsTrigger value="discover" className="flex gap-2">
            <Globe className="h-4 w-4" /> Discover
          </TabsTrigger>
          <TabsTrigger value="joined" className="flex gap-2">
            <Users className="h-4 w-4" /> My Communities
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {communities.map(community => (
              <CommunityCard 
                key={community.id} 
                community={community} 
                onJoin={() => joinCommunity(community.id)} 
                isJoined={community.members.includes(user?.uid || '')}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="joined" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userCommunities.map(community => (
              <CommunityCard 
                key={community.id} 
                community={community} 
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New Community</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input 
              placeholder="Community Name"
              value={newCommunity.name}
              onChange={(e) => setNewCommunity(prev => ({
                ...prev, 
                name: e.target.value
              }))}
            />
            <Input 
              placeholder="Description"
              value={newCommunity.description}
              onChange={(e) => setNewCommunity(prev => ({
                ...prev, 
                description: e.target.value
              }))}
            />
            <Button 
              onClick={createCommunity} 
              className="w-full"
            >
              Create Community
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const CommunityCard = ({ community, onJoin, isJoined }) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border">
      <div className="flex items-center gap-4 mb-4">
        <Avatar>
          <AvatarFallback>
            {community.name[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-bold">{community.name}</h3>
          <p className="text-sm text-gray-500">
            {community.members.length} members
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        {community.description}
      </p>
      <Button 
        onClick={onJoin}
        disabled={isJoined}
        className="w-full"
        variant={isJoined ? "outline" : "default"}
      >
        {isJoined ? (
          <>
            <Check className="h-4 w-4 mr-2" /> Joined
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4 mr-2" /> Join Community
          </>
        )}
      </Button>
    </div>
  );
};

