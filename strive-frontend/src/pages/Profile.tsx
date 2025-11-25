import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Camera, Loader2, LogOut, Mail, Lock, User as UserIcon, Shield } from "lucide-react";
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
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  
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

  // 4. Mutasi: Update Password
  const updatePasswordMutation = useMutation({
    mutationFn: async () => {
       return await authApi.updatePassword(newPassword);
    },
    onSuccess: () => {
        setNewPassword("");
        setConfirmPassword("");
        setIsPasswordDialogOpen(false);
        toast.success("Password changed successfully!");
    },
    onError: (error: Error) => {
        toast.error(error.message || "Failed to update password");
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
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        
        {/* --- SECTION 1: HEADER & AVATAR --- */}
        <div className="text-center space-y-4 pt-4">
          <div className="relative inline-block">
            <div className="relative w-32 h-32 mx-auto">
              {/* Ring Biru Tipis (border-2 border-primary) */}
              <div className="w-full h-full rounded-full border-2 border-primary overflow-hidden bg-muted flex items-center justify-center relative">
                 {profile?.avatar_url ? (
                    <img src={`${profile.avatar_url}?t=${new Date().getTime()}`} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                    <span className="text-5xl font-bold text-muted-foreground/50">
                        {profile?.full_name?.charAt(0).toUpperCase() || "U"}
                    </span>
                 )}
              </div>
              
              {/* Tombol Kamera Floating */}
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors shadow-lg">
                <Camera className="h-5 w-5" strokeWidth={1.5} />
                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
              </label>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{profile?.full_name || "User"}</h1>
            <p className="text-muted-foreground text-sm">Level {profile?.current_level || 1} • {profile?.total_exp} EXP</p>
          </div>
        </div>

        {/* --- SECTION 2: STATS GRID --- */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card border rounded-2xl p-4 text-center shadow-sm">
            <p className="text-2xl font-black text-primary">{profile?.current_level || 1}</p>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Level</p>
          </div>
          <div className="bg-card border rounded-2xl p-4 text-center shadow-sm">
            <p className="text-2xl font-black text-exp">{profile?.total_exp || 0}</p>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total EXP</p>
          </div>
          <div className="bg-card border rounded-2xl p-4 text-center shadow-sm">
            <p className="text-2xl font-black text-streak">{profile?.longest_streak || 0}</p>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Best Streak</p>
          </div>
        </div>

        {/* --- SECTION 3: PERSONAL INFO --- */}
        <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-primary" /> Personal Info
            </h3>
            <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
                
                {/* Email Section - READABLE */}
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                            id="email" 
                            value={profile?.email || ""} 
                            readOnly // Supaya tidak bisa diketik
                            disabled // Supaya tidak bisa difokuskan
                            // Style: Teks hitam (foreground), background agak abu, border biasa
                            className="pl-9 pr-10 bg-muted/20 text-foreground font-medium opacity-100 cursor-default"
                        />
                        <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground/50" />
                    </div>
                    <p className="text-[10px] text-muted-foreground ml-1">
                        Email cannot be changed.
                    </p>
                </div>

                {/* Full Name Section */}
                <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                        id="fullName" 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)} 
                        placeholder="Your name"
                        className="bg-background"
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

        {/* --- SECTION 4: SECURITY & DANGER ZONE --- */}
        <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" /> Security
            </h3>
            <div className="bg-card border rounded-2xl p-1 shadow-sm divide-y">
                
                {/* Change Password Dialog */}
                <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                    <DialogTrigger asChild>
                        <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left">
                            <div className="flex flex-col">
                                <span className="font-medium">Change Password</span>
                                <span className="text-xs text-muted-foreground">Update your password regularly</span>
                            </div>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Change Password</DialogTitle>
                            <DialogDescription>
                                Enter your new password below. Make sure it's secure (min 6 chars).
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>New Password</Label>
                                <Input 
                                    type="password" 
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Minimum 6 characters"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Confirm Password</Label>
                                <Input 
                                    type="password" 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Retype new password"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>Cancel</Button>
                            <Button 
                                onClick={() => updatePasswordMutation.mutate()}
                                disabled={!newPassword || newPassword !== confirmPassword || newPassword.length < 6}
                            >
                                {updatePasswordMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Update Password"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Sign Out */}
                <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors text-left text-destructive"
                >
                    <div className="flex flex-col">
                        <span className="font-medium">Sign Out</span>
                    </div>
                    <LogOut className="h-4 w-4" />
                </button>
            </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;