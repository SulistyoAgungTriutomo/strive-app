import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Mail, Lock } from "lucide-react";
import { authApi } from "@/lib/apiClient";
import { saveToken } from "@/lib/localStorage";
import logoImg from "@/assets/logo.png"; 

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

const SignIn = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handler Login Email/Password
  const onSubmit = async (data: SignInFormValues) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      if (response?.session?.access_token) {
        saveToken(response.session.access_token);
        toast.success("Welcome back!");
        navigate("/dashboard");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler Login Google
  const handleGoogleLogin = async () => {
    try {
        const res = await authApi.getGoogleUrl();
        if (res.url) {
            // Redirect user ke URL Google yang diberikan backend
            window.location.href = res.url;
        }
    } catch (error) {
        toast.error("Failed to initialize Google Login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      
      {/* --- BAGIAN LOGO & BRANDING --- */}
      <div className="text-center mb-8 space-y-2">
        <img 
          src={logoImg} 
          alt="Strive Logo" 
          className="h-16 mx-auto shadow-sm rounded-xl" 
        />
        <h1 className="text-3xl font-bold tracking-tight">Strive</h1>
        <p className="text-muted-foreground text-sm">
          Build habits. Level up. Thrive.
        </p>
      </div>

      {/* --- CARD FORM --- */}
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Continue your habit-building journey
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-6">
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      placeholder="name@example.com"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      className="pl-9"
                      disabled={isLoading}
                      {...form.register("email")}
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      placeholder="Enter your password"
                      type="password"
                      className="pl-9"
                      disabled={isLoading}
                      {...form.register("password")}
                    />
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button 
                variant="outline" 
                type="button" 
                disabled={isLoading}
                onClick={handleGoogleLogin}
            >
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
              Google
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;