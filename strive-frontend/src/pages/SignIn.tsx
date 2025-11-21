import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { authApi } from "@/lib/apiClient";
import { saveToken } from "@/lib/localStorage";

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Request Login ke Backend
      const response = await authApi.login({ email, password });

      // 2. Simpan Token
      if (response?.session?.access_token) {
        saveToken(response.session.access_token);
        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        throw new Error("No access token received");
      }
    } catch (error) {
      
      console.error(error);
      
      // Kita gunakan 'as Error' untuk memberitahu TypeScript bahwa ini adalah objek Error
      // agar kita bisa mengakses properti .message tanpa error.
      toast.error((error as Error).message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to continue your progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
            </Button>
            <div className="text-center text-sm">
              Don't have an account? <Button variant="link" className="p-0" onClick={() => navigate("/signup")}>Sign up</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;