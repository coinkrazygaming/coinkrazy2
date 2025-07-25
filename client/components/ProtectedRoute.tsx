import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Loader2, Lock, Gift } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireStaff?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requireAdmin = false,
  requireStaff = false,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      // Don't redirect, just show login prompt
    }
  }, [user, loading, requireAuth]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading CoinKrazy...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto casino-glow">
            <CardHeader className="text-center">
              <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-2xl">Login Required</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                You need to be logged in to access this page. Join CoinKrazy for
                FREE and get your welcome bonus!
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full casino-pulse" size="lg">
                  <Link to="/auth">
                    <Gift className="w-5 h-5 mr-2" />
                    🎁 Sign Up & Get 10,000 GC + 10 SC FREE!
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/auth">Already have an account? Login</Link>
                </Button>
                <Button asChild variant="ghost" className="w-full">
                  <Link to="/">← Back to Casino Lobby</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check admin permissions
  if (requireAdmin && user && !user.is_admin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto casino-glow">
            <CardHeader className="text-center">
              <Lock className="w-12 h-12 text-destructive mx-auto mb-4" />
              <CardTitle className="text-2xl">Access Denied</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                You need administrator privileges to access this page.
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link to="/dashboard">← Return to Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check staff permissions
  if (requireStaff && user && !user.is_staff && !user.is_admin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto casino-glow">
            <CardHeader className="text-center">
              <Lock className="w-12 h-12 text-destructive mx-auto mb-4" />
              <CardTitle className="text-2xl">Access Denied</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                You need staff privileges to access this page.
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link to="/dashboard">← Return to Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
