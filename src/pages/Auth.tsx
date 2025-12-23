import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_EMAIL = "jasproject.co@gmail.com";

const emailSchema = z.string().trim().email("Invalid email address").max(255);
const passwordSchema = z.string().min(6, "Password must be at least 6 characters").max(72);

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Check if email is admin email
  useEffect(() => {
    setIsAdminLogin(email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      emailSchema.parse(email);

      if (isAdminLogin) {
        // Admin login with password
        passwordSchema.parse(password);
        
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Login failed",
              description: "Invalid email or password. Please try again.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Login failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });
          navigate("/");
        }
      } else {
        // Regular user - send magic link
        const redirectUrl = `${window.location.origin}/orders`;
        
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: redirectUrl,
          }
        });

        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          setMagicLinkSent(true);
          toast({
            title: "Check your email",
            description: "We've sent you a login link to access your account.",
          });
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (magicLinkSent) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <div className="max-w-md mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-light mb-4">
              Check Your Email
            </h1>
            <p className="font-body text-muted-foreground mb-8">
              We've sent a login link to <strong>{email}</strong>. Click the link to access your orders.
            </p>
            <button
              onClick={() => {
                setMagicLinkSent(false);
                setEmail("");
              }}
              className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors underline"
            >
              Use a different email
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12">
        <div className="max-w-md mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-light mb-2 text-center">
            Access Your Account
          </h1>
          <p className="text-center font-body text-muted-foreground mb-8">
            Enter your email to view your orders
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-border rounded-full px-5 py-3 font-body text-sm focus:outline-none focus:border-charcoal transition-colors"
            />
            
            {isAdminLogin && (
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-border rounded-full px-5 py-3 font-body text-sm focus:outline-none focus:border-charcoal transition-colors"
              />
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-charcoal text-primary-foreground rounded-full py-4 font-body text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting
                ? "Please wait..."
                : isAdminLogin
                ? "Sign In"
                : "Send Login Link"}
            </button>
          </form>

          {!isAdminLogin && (
            <p className="mt-6 text-center font-body text-xs text-muted-foreground">
              No password needed. We'll send you a secure login link.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
