import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { toast, useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useProfile } from "@/hooks/useProfile";
import { usePosts } from "@/hooks/usePosts";
import FriendSuggestions from "@/app/components/FriendSuggestions";
import { Textarea } from "@/components/ui/textarea";
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
import { useAuth } from "@/hooks/useAuth";

export const CreatePostModal = ({ open, onOpenChange }) => {
    const [caption, setCaption] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
  
    const handleImageChange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        setImage(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      }
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!caption && !image) return;
  
      setLoading(true);
      try {
        let imageUrl = "";
        if (image) {
          const formData = new FormData();
          formData.append("image", image);
          formData.append("key", IMGBB_API_KEY);
  
          const response = await fetch("https://api.imgbb.com/1/upload", {
            method: "POST",
            body: formData,
          });
          const data = await response.json();
          imageUrl = data.data.url;
        }
  
        await addDoc(collection(db, "posts"), {
          userId: user.uid,
          username: user.displayName,
          caption,
          imageUrl,
          createdAt: serverTimestamp(),
          likes: [],
          comments: [],
        });
  
        toast({
          title: "Post created successfully",
        });
        onOpenChange(false);
      } catch (error) {
        toast({
          title: "Error creating post",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Write a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>
  
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="rounded-lg max-h-[300px] w-full object-cover"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setImage(null);
                    setPreview("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border-2 border-dashed">
                <label className="cursor-pointer flex flex-col items-center">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-500">Add a photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
  
            <DialogFooter>
              <Button type="submit" disabled={loading || (!caption && !image)}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  
}

