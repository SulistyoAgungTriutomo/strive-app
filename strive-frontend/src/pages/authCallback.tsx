// src/pages/AuthCallback.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveToken } from "@/lib/localStorage";
import { toast } from "sonner";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase mengembalikan token di URL Hash (#access_token=...)
    const hash = window.location.hash;
    
    if (hash) {
      // Parsing hash manual
      const params = new URLSearchParams(hash.substring(1)); // Hapus karakter '#'
      const accessToken = params.get("access_token");
      const error = params.get("error_description");

      if (accessToken) {
        // 1. Simpan Token
        saveToken(accessToken);
        // 2. Beri notifikasi
        toast.success("Successfully logged in with Google!");
        // 3. Redirect ke Dashboard
        navigate("/dashboard");
      } else if (error) {
        toast.error(error);
        navigate("/signin");
      }
    } else {
      // Jika tidak ada hash, mungkin user nyasar
      navigate("/signin");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Finalizing login...</p>
      </div>
    </div>
  );
};

export default AuthCallback;