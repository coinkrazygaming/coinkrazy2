import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Chrome, Facebook, Twitter } from "lucide-react";

export default function OAuthTest() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch("/api/oauth/providers");
        if (response.ok) {
          const data = await response.json();
          setProviders(data.providers || []);
        } else {
          setError(`Failed to fetch providers: ${response.status}`);
        }
      } catch (err) {
        setError(`Network error: ${err}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  const handleOAuthLogin = (provider: string) => {
    if (provider === "google") {
      window.location.href = "/api/oauth/google";
    } else {
      alert(`${provider} OAuth not yet implemented`);
    }
  };

  const testAdminLogin = async () => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "coinkrazy00@gmail.com",
          password: "Woot6969!",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(
          `Admin login successful! User: ${data.user.username}, Admin: ${data.user.is_admin}, Staff: ${data.user.is_staff}`,
        );
        localStorage.setItem("token", data.token);
      } else {
        alert(`Login failed: ${data.message}`);
      }
    } catch (err) {
      alert(`Login error: ${err}`);
    }
  };

  if (loading) return <div className="p-8">Loading OAuth providers...</div>;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>OAuth2 Test Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Admin User Test</h3>
              <Button onClick={testAdminLogin} className="w-full">
                Test Admin Login (coinkrazy00@gmail.com)
              </Button>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">OAuth Providers</h3>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  Error: {error}
                </div>
              )}

              <div className="space-y-2">
                {providers.map((provider) => (
                  <Button
                    key={provider.name}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleOAuthLogin(provider.name)}
                    disabled={!provider.enabled}
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
                      <Badge variant="secondary" className="ml-auto">
                        {provider.note || "Disabled"}
                      </Badge>
                    )}
                    {provider.enabled && (
                      <Badge variant="default" className="ml-auto">
                        Ready
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            <div className="bg-muted p-4 rounded">
              <h4 className="font-medium mb-2">Setup Instructions:</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>
                  Configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env
                </li>
                <li>
                  Add http://localhost:8080/api/oauth/google/callback to Google
                  OAuth redirect URIs
                </li>
                <li>
                  The admin user coinkrazy00@gmail.com/Woot6969! should work for
                  testing
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
