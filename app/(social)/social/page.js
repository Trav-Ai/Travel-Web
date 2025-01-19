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

const IMGBB_API_KEY = "ebff71d58cb2bef2855217f989765dce";

// Utility Components
const StatItem = ({ label, value }) => (
  <div className="text-center">
    <p className="font-bold text-lg">{value}</p>
    <p className="text-gray-600 text-sm">{label}</p>
  </div>
);

const EditProfileModal = ({ open, onOpenChange, profile, user }) => {
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

const MainLayout = ({ children }) => {
  const [modals, setModals] = useState({
    search: false,
    createPost: false,
    settings: false,
    editProfile: false,
  });
  const [activeTab, setActiveTab] = useState("home");
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/signup");
      toast({
        title: "Logged out successfully",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleModal = (modalName) => {
    setModals((prev) => ({
      ...prev,
      [modalName]: !prev[modalName],
    }));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-5xl">+</div>
      </div>
    );
  }

  if (!user) {
    router.push("/signup");
    return null;
  }

  const renderMainContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <PostFeed />
            </div>
            <div className="space-y-6">
              <FriendSuggestions />
            </div>
          </div>
        );
      case "profile":
        return (
          <div className="space-y-6">
            {children}
           
          </div>
        );
      case "messages":
        return <div>{children}</div>;
      default:
        return <div>{children}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <nav className="w-64 border-r bg-white fixed h-full shadow-sm transition-all duration-300 ease-in-out">
        <div className="p-4 space-y-6">
          <div className="flex items-center gap-2">
            <Camera className="h-6 w-6 text-[#060511]" />
            <h1 className="text-2xl font-bold text-[#060511]">TravelSocial</h1>
          </div>

          <div className="space-y-2">
            <NavItem
              icon={<Home className="h-5 w-5" />}
              label="Home"
              onClick={() => setActiveTab("home")}
              active={activeTab === "home"}
            />
            {/* <NavItem
              icon={<MessageCircle className="h-5 w-5" />}
              label="Messages"
              badge={3}
              onClick={() => setActiveTab("messages")}
              active={activeTab === "messages"}
            /> */}
            <NavItem
              icon={<User className="h-5 w-5" />}
              label="Profile"
              onClick={() => setActiveTab("profile")}
              active={activeTab === "profile"}
            />
            <NavItem
              icon={<Search className="h-5 w-5" />}
              label="Search"
              onClick={() => toggleModal("search")}
            />
            <NavItem
              icon={<Settings className="h-5 w-5" />}
              label="Settings"
              onClick={() => toggleModal("settings")}
            />
          </div>

          <Button
            onClick={() => toggleModal("createPost")}
            className="w-full gap-2 bg-[#060511] hover:bg-[#4e4d5d] transition-colors duration-300"
          >
            <Plus className="h-5 w-5" /> Create Post
          </Button>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full gap-2 mt-auto text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" /> Logout
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-6">
        <div className="max-w-4xl mx-auto">{renderMainContent()}</div>
      </div>

      {/* Modals */}
      <SearchModal
        open={modals.search}
        onOpenChange={(open) =>
          setModals((prev) => ({ ...prev, search: open }))
        }
      />
      <CreatePostModal
        open={modals.createPost}
        onOpenChange={(open) =>
          setModals((prev) => ({ ...prev, createPost: open }))
        }
      />
    </div>
  );
};

const NavItem = ({ icon, label, badge, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-colors ${
      active ? "bg-gray-100 text-[#060511]" : "text-gray-700 hover:bg-gray-50"
    }`}
  >
    {icon}
    <span className="flex-1 text-left">{label}</span>
    {badge && (
      <span className="bg-[#060511] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
        {badge}
      </span>
    )}
  </button>
);

// Added missing ProfileSkeleton component
const ProfileSkeleton = () => (
  <div className="space-y-8">
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-8">
        <Skeleton className="w-32 h-32 rounded-full" />
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="flex gap-8 mb-4">
            <Skeleton className="h-16 w-24" />
            <Skeleton className="h-16 w-24" />
            <Skeleton className="h-16 w-24" />
          </div>
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} className="aspect-square rounded-lg" />
      ))}
    </div>
  </div>
);

// Added missing SearchModal component
const SearchModal = ({ open, onOpenChange }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const usersRef = collection(db, "posts");
      const q = query(
        usersRef,
        where("username", ">=", searchQuery.toLowerCase()),
        where("username", "<=", searchQuery.toLowerCase() + "\uf8ff")
      );
      const snapshot = await getDocs(q);
      setResults(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    } catch (error) {
      toast({
        title: "Error searching",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) handleSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading ? (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg"
                >
                  <Avatar>
                    <AvatarImage src={user.photoURL} />
                    <AvatarFallback>
                      {user.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.username}</p>
                    <p className="text-sm text-gray-500">
                      {user.bio || "No bio"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Added missing CreatePostModal component
const CreatePostModal = ({ open, onOpenChange }) => {
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
};

const ProfilePage = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile(user?.uid);
  const { posts, loading: postsLoading } = usePosts(user?.uid);
  const [activeTab, setActiveTab] = useState("posts");
  const [modals, setModals] = useState({
    search: false,
    createPost: false,
    settings: false,
    editProfile: false,
  });
  const toggleModal = (modalName) => {
    setModals((prev) => ({
      ...prev,
      [modalName]: !prev[modalName],
    }));
  };


  if (profileLoading || postsLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-8">
             <Avatar className="w-32 h-32">
              <AvatarImage src={user?.photoURL||""}  />
              <AvatarFallback>
                {profile?.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar> 

            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-2xl font-bold">{user.displayName|| profile?.username}</h1>
                <Button
                  variant="outline"
                  onClick={() => toggleModal("editProfile")}
                >
                  Edit Profile
                </Button>

                {/* Add this before the closing div */}
                <EditProfileModal
                  open={modals.editProfile}
                  onOpenChange={(open) =>
                    setModals((prev) => ({ ...prev, editProfile: open }))
                  }
                  profile={profile}
                  user={user}
                />
              </div>

              <div className="flex gap-8 mb-4">
                <StatItem label="Posts" value={posts?.length || 0} />
                <StatItem
                  label="Followers"
                  value={profile?.followers?.length || 0}
                />
                <StatItem
                  label="Following"
                  value={profile?.following?.length || 0}
                />
              </div>

              <p className="text-gray-600">{profile?.bio || "No bio yet"}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none">
            <TabsTrigger value="posts" className="flex gap-2">
              <ImageIcon className="h-4 w-4" /> Posts
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex gap-2">
              <Bookmark className="h-4 w-4" /> Saved
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <div className="grid grid-cols-3 gap-4">
              {posts?.map((post) => (
                <PostGridItem key={post.id} post={post} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="saved">
            <div className="text-center py-8 text-gray-500">
              No saved posts yet
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
