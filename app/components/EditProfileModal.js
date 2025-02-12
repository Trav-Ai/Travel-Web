"use client";
import { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  Home,
  User,
  Search,
  Settings,
  Plus,
  LogOut,
  Loader2,
  Image as ImageIcon,
  X,
  Bookmark,
  Camera,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseConfig";
import { signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  serverTimestamp,
  where,
  getDocs,
} from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast, useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useProfile } from "@/hooks/useProfile";
import { usePosts } from "@/hooks/usePosts";
import PostGridItem from "@/app/components/PostGridItem";
import PostFeed from "@/app/components/PostFeed";
import FriendSuggestions from "@/app/components/FriendSuggestions";
import { Textarea } from "@/components/ui/textarea";
import { CreatePostModal } from "@/app/components/CreatePostModal";

const IMGBB_API_KEY = "ebff71d58cb2bef2855217f989765dce";

export const EditProfileModal = ({ open, onOpenChange, profile, user }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
      displayName: profile?.username || "",
      bio: profile?.bio || "",
      image: null,
      imagePreview: profile?.photoURL || "",
    });
    const { toast } = useToast();
  
    const handleImageChange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        setFormData((prev) => ({
          ...prev,
          image: file,
          imagePreview: URL.createObjectURL(file),
        }));
      }
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
  
      try {
        let photoURL = profile?.photoURL;
  
        if (formData.image) {
          const formData = new FormData();
          formData.append("image", formData.image);
          formData.append("key", IMGBB_API_KEY);
  
          const response = await fetch("https://api.imgbb.com/1/upload", {
            method: "POST",
            body: formData,
          });
          const data = await response.json();
          photoURL = data.data.url;
        }
  
        // Update Firestore profile
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          username: formData.displayName,
          bio: formData.bio,
          photoURL,
        });
  
        // Update Firebase Auth profile
        await updateProfile(user, {
          displayName: formData.displayName,
          photoURL,
        });
  
        toast({
          title: "Profile updated successfully",
          duration: 2000,
        });
        onOpenChange(false);
      } catch (error) {
        toast({
          title: "Error updating profile",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={formData.imagePreview} />
                  <AvatarFallback>
                    {formData.displayName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 bg-gray-100 p-2 rounded-full cursor-pointer hover:bg-gray-200">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
  
            <div className="space-y-4">
              <div>
                <div htmlFor="displayName">Display Name</div>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      displayName: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <div htmlFor="bio">Bio</div>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  className="h-24"
                />
              </div>
            </div>
  
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };
