import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Import Adaptor dan API
import { getProfile, removeToken } from "@/lib/localStorage";
import { authApi } from "@/lib/apiClient";

const Profile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State untuk form
  const [editName, setEditName] = useState("");
  
  // 1. Fetch Profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  // Update state form saat data profil dimuat
  useEffect(() => {
    if (profile?.full_name) {
      setEditName(profile.full_name);
    }
  }, [profile]);

  // 2. Mutasi: Upload Avatar
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];
    
    if (file.size > 2 * 1024 * 1024) {
        toast.error("File too large. Max 2MB.");
        return;
    }

    toast.promise(authApi.uploadAvatar(file), {
        loading: 'Uploading avatar...',
        success: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            return "Avatar updated!";
        },
        error: "Failed to upload avatar"
    });
  };

  // 3. Mutasi: Update Profile (Nama)
  const updateProfileMutation = useMutation({
    mutationFn: async () => {
        return await authApi.updateProfile({ full_name: editName });
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        toast.success("Profile updated successfully!");
    },
    onError: (error: Error) => {
        toast.error(error.message || "Failed to update profile");
    }
  });

  const handleSignOut = () => {
    removeToken();
    navigate("/signin");
    toast.success("Signed out successfully");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        {/* Header & Avatar */}
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="relative w-32 h-32 mx-auto">
              <div className="w-full h-full rounded-full border-2 border-primary overflow-hidden bg-muted flex items-center justify-center relative">
                 {profile?.avatar_url ? (
                    <img src={`${profile.avatar_url}?t=${new Date().getTime()}`} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                    <span className="text-4xl font-bold text-muted-foreground">
                        {profile?.full_name?.charAt(0).toUpperCase() || "U"}
                    </span>
                 )}
              </div>
              
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors shadow-lg">
                <Camera className="h-5 w-5" strokeWidth={1.5} />
                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
              </label>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{profile?.full_name || "User"}</h1>
            <p className="text-muted-foreground">Level {profile?.current_level || 1} • {profile?.total_exp} EXP</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card rounded-2xl p-4 text-center shadow-md">
            <p className="text-2xl font-bold text-primary">{profile?.current_level || 1}</p>
            <p className="text-sm text-muted-foreground">Level</p>
          </div>
          <div className="bg-card rounded-2xl p-4 text-center shadow-md">
            <p className="text-2xl font-bold text-exp">{profile?.total_exp || 0}</p>
            <p className="text-sm text-muted-foreground">EXP</p>
          </div>
          <div className="bg-card rounded-2xl p-4 text-center shadow-md">
            <p className="text-2xl font-bold text-streak">{profile?.longest_streak || 0}</p>
            <p className="text-sm text-muted-foreground">Streak</p>
          </div>
        </div>

        {/* Form Edit Profile */}
        <div className="bg-card rounded-2xl p-6 shadow-md space-y-4">
            <h3 className="font-semibold text-lg">Account Settings</h3>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                        id="fullName" 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)} 
                        placeholder="Your name"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                        id="email" 
                        value={profile?.email || ""} 
                        disabled 
                        className="bg-muted text-muted-foreground cursor-not-allowed"
                    />
                </div>
                <Button 
                    onClick={() => updateProfileMutation.mutate()} 
                    disabled={updateProfileMutation.isPending}
                    className="w-full"
                >
                    {updateProfileMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
                </Button>
            </div>
        </div>

        {/* Sign Out */}
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive" size="lg" onClick={handleSignOut}>
            <LogOut className="h-5 w-5 mr-3" strokeWidth={1.5} />
            Sign Out
          </Button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;