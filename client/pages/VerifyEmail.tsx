import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, XCircle, Mail, Gift } from "lucide-react";
import { toast } from "sonner";

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "pending" | "success" | "error"
  >("pending");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [bonusAwarded, setBonusAwarded] = useState<{
    goldCoins: number;
    sweepsCoins: number;
  } | null>(null);
  const [emailForResend, setEmailForResend] = useState("");
  const [isResending, setIsResending] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    setIsVerifying(true);
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setVerificationStatus("success");
        setVerificationMessage(data.message);
        setBonusAwarded(data.bonusAwarded);
        toast.success("Email verified! Welcome bonus awarded!");

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate("/dashboard");
        }, 3000);
      } else {
        setVerificationStatus("error");
        setVerificationMessage(data.message || "Email verification failed");
        toast.error(data.message || "Email verification failed");
      }
    } catch (error) {
      setVerificationStatus("error");
      setVerificationMessage("Failed to verify email. Please try again.");
      toast.error("Failed to verify email. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const resendVerification = async () => {
    if (!emailForResend) {
      toast.error("Please enter your email address");
      return;
    }

    setIsResending(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailForResend }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Verification email resent! Please check your inbox.");
        // For development, show the verification URL
        if (data.verificationUrl) {
          console.log("Verification URL:", data.verificationUrl);
          toast.info("Check console for verification URL (development mode)");
        }
      } else {
        toast.error(data.message || "Failed to resend verification email");
      }
    } catch (error) {
      toast.error("Failed to resend verification email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-red-900 to-purple-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md casino-glow">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
              {verificationStatus === "pending" && (
                <Mail className="w-8 h-8 text-white" />
              )}
              {verificationStatus === "success" && (
                <CheckCircle className="w-8 h-8 text-white" />
              )}
              {verificationStatus === "error" && (
                <XCircle className="w-8 h-8 text-white" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Email Verification
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {!token && "Verify your email to claim your welcome bonus"}
            {token &&
              verificationStatus === "pending" &&
              "Verifying your email..."}
            {token &&
              verificationStatus === "success" &&
              "Email verified successfully!"}
            {token && verificationStatus === "error" && "Verification failed"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!token && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={emailForResend}
                  onChange={(e) => setEmailForResend(e.target.value)}
                />
              </div>
              <Button
                onClick={resendVerification}
                disabled={isResending}
                className="w-full bg-yellow-600 hover:bg-yellow-700"
              >
                {isResending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Resend Verification Email
              </Button>
            </div>
          )}

          {token && isVerifying && (
            <div className="text-center space-y-4">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-yellow-500" />
              <p className="text-muted-foreground">Verifying your email...</p>
            </div>
          )}

          {token && verificationStatus === "success" && bonusAwarded && (
            <div className="text-center space-y-4">
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                <Gift className="mx-auto h-8 w-8 text-green-500 mb-2" />
                <h3 className="font-bold text-green-400 mb-2">
                  Welcome Bonus Awarded! 🎊
                </h3>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium text-yellow-400">
                      {bonusAwarded.goldCoins.toLocaleString()} Gold Coins
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-purple-400">
                      {bonusAwarded.sweepsCoins} Sweeps Coins
                    </span>
                  </p>
                </div>
              </div>
              <p className="text-sm text-green-400">{verificationMessage}</p>
              <p className="text-xs text-muted-foreground">
                Redirecting to dashboard in 3 seconds...
              </p>
            </div>
          )}

          {token && verificationStatus === "error" && (
            <div className="text-center space-y-4">
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                <XCircle className="mx-auto h-6 w-6 text-red-500 mb-2" />
                <p className="text-sm text-red-400">{verificationMessage}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="resend-email">
                  Try resending verification email:
                </Label>
                <Input
                  id="resend-email"
                  type="email"
                  placeholder="Enter your email"
                  value={emailForResend}
                  onChange={(e) => setEmailForResend(e.target.value)}
                />
                <Button
                  onClick={resendVerification}
                  disabled={isResending}
                  variant="outline"
                  className="w-full"
                >
                  {isResending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Resend Verification Email
                </Button>
              </div>
            </div>
          )}

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/auth")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
