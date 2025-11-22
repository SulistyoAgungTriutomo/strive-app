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
import { Loader2, User, Mail, Lock } from "lucide-react";
import { authApi } from "@/lib/apiClient";
import { saveToken } from "@/lib/localStorage";
import logoImg from "@/assets/logo.png";

const signUpSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignUpFormValues) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(data);
      if (response?.session?.access_token) {
          saveToken(response.session.access_token);
          toast.success("Account created! Welcome to Strive!");
          navigate("/dashboard");
      } else {
          toast.success("Account created! Please sign in.");
          navigate("/signin");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Container utama flex-col untuk menumpuk Logo dan Card
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      
      {/* --- BAGIAN LOGO & BRANDING (DI LUAR CARD) --- */}
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
          <CardTitle className="text-xl font-bold">Join Strive</CardTitle>
          <CardDescription>
            Start building better habits today
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Full Name</Label>
                <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="username"
                        type="text"
                        placeholder="John Doe"
                        className="pl-9"
                        {...form.register("username")}
                    />
                </div>
                {form.formState.errors.username && (
                  <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        className="pl-9"
                        {...form.register("email")}
                    />
                </div>
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="password"
                        type="password"
                        className="pl-9"
                        {...form.register("password")}
                    />
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/signin" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;