import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Crown,
  Mail,
  Lock,
  User,
  Gift,
  Eye,
  EyeOff,
  Facebook,
  Twitter,
  ArrowLeft,
  Chrome,
} from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register, user, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("register");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [oauthProviders, setOauthProviders] = useState<any[]>([]);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    country: "United States",
    state: "",
    zipCode: "",
    phone: "",
    agreeToTerms: false,
  });

  // Check for OAuth callback token in URL
  useEffect(() => {
    const token = searchParams.get("token");
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (token && success === "true") {
      // Store the token and redirect
      localStorage.setItem("token", token);
      toast.success("OAuth login successful! Welcome!");
      navigate("/dashboard");
    } else if (error) {
      toast.error(`OAuth login failed: ${error.replace("_", " ")}`);
      // Clean up URL
      navigate("/auth", { replace: true });
    }
  }, [searchParams, navigate]);

  // Fetch available OAuth providers
  useEffect(() => {
    const fetchOAuthProviders = async () => {
      try {
        const response = await fetch("/api/oauth/providers");
        if (response.ok) {
          const data = await response.json();
          setOauthProviders(data.providers || []);
        }
      } catch (error) {
        console.error("Failed to fetch OAuth providers:", error);
      }
    };

    fetchOAuthProviders();
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(loginData.email, loginData.password);
      if (success) {
        toast.success("Login successful! Welcome back!");
        navigate("/dashboard");
      } else {
        toast.error("Invalid email or password. Please try again.");
      }
    } catch (error) {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !registerData.username ||
      !registerData.email ||
      !registerData.password
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (registerData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!registerData.agreeToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    setIsLoading(true);
    try {
      const success = await register({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        dateOfBirth: registerData.dateOfBirth,
        country: registerData.country,
        state: registerData.state,
        zipCode: registerData.zipCode,
        phone: registerData.phone,
      });

      if (success) {
        toast.success("Registration successful! 🎉");
        toast.info(
          "📧 Please check your email to verify your account and claim your 10,000 GC + 10 SC welcome bonus!",
        );
        // Don't navigate immediately - user needs to verify email first
        setActiveTab("login"); // Switch to login tab for better UX
      } else {
        toast.error(
          "Registration failed. Email or username may already exist.",
        );
      }
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      // Mock reset password functionality
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      if (response.ok) {
        toast.success("Password reset email sent! Check your inbox.");
        setShowResetPassword(false);
        setResetEmail("");
      } else {
        toast.error("Email not found in our system.");
      }
    } catch (error) {
      toast.error("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDemoCredentials = (type: "admin" | "staff" | "user") => {
    if (type === "admin") {
      setLoginData({
        email: "coinkrazy00@gmail.com",
        password: "Woot6969!",
      });
      toast.success("Admin credentials loaded!");
    } else if (type === "staff") {
      setLoginData({
        email: "coinkrazy00@gmail.com",
        password: "Woot6969!",
      });
      toast.success("Staff credentials loaded!");
    } else {
      setLoginData({
        email: "demo1@coinkriazy.com",
        password: "demo123",
      });
      toast.success("Demo user credentials loaded!");
    }
  };

  const handleOAuthLogin = (provider: string) => {
    if (provider === "google") {
      window.location.href = "/api/oauth/google";
    } else if (provider === "facebook") {
      toast.info("Facebook OAuth coming soon!");
    } else {
      toast.error("Unknown OAuth provider");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center casino-pulse">
                  <Crown className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  CoinKrazy.com
                </h1>
              </div>
            </Link>
            <Button variant="ghost" asChild>
              <Link to="/" className="flex items-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Casino
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Welcome Banner */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 mb-4 bg-primary/10 px-4 py-2 rounded-full">
              <Gift className="w-5 h-5 text-primary" />
              <span className="text-primary font-semibold">
                🎁 Welcome Bonus Available!
              </span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Join CoinKrazy! 🎰
            </h1>
            <p className="text-muted-foreground">
              Get 10,000 GC + 10 SC FREE when you verify your email! 🎊
            </p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="register">Register 🆕</TabsTrigger>
              <TabsTrigger value="login">Login 🔐</TabsTrigger>
            </TabsList>

            <TabsContent value="register">
              <Card className="casino-glow">
                <CardHeader>
                  <CardTitle className="text-center flex items-center justify-center">
                    <User className="w-5 h-5 mr-2 text-primary" />
                    Create Account
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Choose a cool username 😎"
                        value={registerData.username}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            username: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="First name"
                          value={registerData.firstName}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              firstName: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Last name"
                          value={registerData.lastName}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              lastName: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={registerData.email}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={registerData.dateOfBirth}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            dateOfBirth: e.target.value,
                          })
                        }
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Must be 18+ to play 🔞
                      </p>
                    </div>

                    <div className="relative">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password 💪"
                          value={registerData.password}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              password: e.target.value,
                            })
                          }
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="relative">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password ✅"
                          value={registerData.confirmPassword}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              confirmPassword: e.target.value,
                            })
                          }
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="agreeToTerms"
                        checked={registerData.agreeToTerms}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            agreeToTerms: e.target.checked,
                          })
                        }
                        required
                        className="rounded"
                      />
                      <Label htmlFor="agreeToTerms" className="text-sm">
                        I agree to the{" "}
                        <a href="#" className="text-primary hover:underline">
                          Terms & Conditions
                        </a>{" "}
                        and{" "}
                        <a href="#" className="text-primary hover:underline">
                          Privacy Policy
                        </a>
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 casino-pulse"
                      size="lg"
                      disabled={isLoading}
                    >
                      <Gift className="w-5 h-5 mr-2" />
                      {isLoading
                        ? "Creating Account..."
                        : "🎊 Create Account & Get FREE Bonus!"}
                    </Button>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-4">
                        Or register with social media
                      </p>
                      <div className="space-y-2">
                        {oauthProviders.map((provider) => (
                          <Button
                            key={provider.name}
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => handleOAuthLogin(provider.name)}
                            disabled={!provider.enabled || isLoading}
                          >
                            {provider.name === "google" && (
                              <Chrome className="w-4 h-4 mr-2" />
                            )}
                            {provider.name === "facebook" && (
                              <Facebook className="w-4 h-4 mr-2" />
                            )}
                            {provider.name === "twitter" && (
                              <Twitter className="w-4 h-4 mr-2" />
                            )}
                            {provider.displayName}
                            {!provider.enabled && (
                              <Badge
                                variant="secondary"
                                className="ml-2 text-xs"
                              >
                                {provider.note || "Soon"}
                              </Badge>
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="login">
              <Card className="casino-glow">
                <CardHeader>
                  <CardTitle className="text-center flex items-center justify-center">
                    <Lock className="w-5 h-5 mr-2 text-primary" />
                    Welcome Back!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="loginEmail">Email Address</Label>
                      <Input
                        id="loginEmail"
                        type="email"
                        placeholder="your.email@example.com"
                        value={loginData.email}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="relative">
                      <Label htmlFor="loginPassword">Password</Label>
                      <div className="relative">
                        <Input
                          id="loginPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={loginData.password}
                          onChange={(e) =>
                            setLoginData({
                              ...loginData,
                              password: e.target.value,
                            })
                          }
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="remember"
                          className="rounded"
                        />
                        <Label htmlFor="remember" className="text-sm">
                          Remember me
                        </Label>
                      </div>
                      <a
                        href="#"
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot password?
                      </a>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? "Logging in..." : "🎰 Login & Play Now!"}
                    </Button>

                    {/* Admin/Staff Testing Credentials */}
                    <div className="border-t border-border pt-4 mt-4">
                      <p className="text-xs text-muted-foreground text-center mb-3">
                        Quick Login (For Testing)
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => loadDemoCredentials("admin")}
                          className="text-xs"
                        >
                          🔑 Admin Panel
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => loadDemoCredentials("staff")}
                          className="text-xs"
                        >
                          👨‍💼 Staff Panel
                        </Button>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-4">
                        Or login with social media
                      </p>
                      <div className="space-y-2">
                        {oauthProviders.map((provider) => (
                          <Button
                            key={provider.name}
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => handleOAuthLogin(provider.name)}
                            disabled={!provider.enabled || isLoading}
                          >
                            {provider.name === "google" && (
                              <Chrome className="w-4 h-4 mr-2" />
                            )}
                            {provider.name === "facebook" && (
                              <Facebook className="w-4 h-4 mr-2" />
                            )}
                            {provider.name === "twitter" && (
                              <Twitter className="w-4 h-4 mr-2" />
                            )}
                            {provider.displayName}
                            {!provider.enabled && (
                              <Badge
                                variant="secondary"
                                className="ml-2 text-xs"
                              >
                                {provider.note || "Soon"}
                              </Badge>
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Bonus Info */}
          <div className="mt-8 text-center">
            <Badge className="bg-accent text-accent-foreground mb-4 text-sm py-2 px-4">
              🎁 New Player Bonus Details
            </Badge>
            <div className="bg-card p-4 rounded-lg border border-border">
              <h3 className="font-semibold text-primary mb-2">
                Welcome Package 🎊
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>💰 10,000 Gold Coins (GC) - Play all games!</li>
                <li>✨ 10 Sweepstakes Cash (SC) - Win real prizes!</li>
                <li>📧 Welcome email with bonus details</li>
                <li>🎯 Access to daily mini games</li>
                <li>🏆 VIP treatment from day one</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
