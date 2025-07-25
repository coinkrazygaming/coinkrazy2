import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield,
  Crown,
  Star,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react";

interface SweepstakesTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  gameName: string;
}

export default function SweepstakesTermsModal({
  isOpen,
  onClose,
  onAccept,
  gameName,
}: SweepstakesTermsModalProps) {
  const [hasRead, setHasRead] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [confirmedAge, setConfirmedAge] = useState(false);

  if (!isOpen) return null;

  const canProceed = hasRead && agreedToTerms && confirmedAge;

  const handleAccept = () => {
    if (canProceed) {
      onAccept();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] casino-glow border-primary/30">
        <CardHeader className="relative bg-gradient-to-r from-primary/20 to-accent/20 border-b border-primary/30">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="text-center space-y-3">
            <div className="flex items-center justify-center space-x-2">
              <Crown className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                CoinKrazy.com
              </span>
            </div>

            <CardTitle className="text-xl text-foreground">
              🎰 Sweepstakes Social Casino Terms
            </CardTitle>

            <div className="flex items-center justify-center space-x-2">
              <Badge className="bg-primary text-primary-foreground">
                <Shield className="w-3 h-3 mr-1" />
                Legal & Compliant
              </Badge>
              <Badge className="bg-accent text-accent-foreground">
                <Star className="w-3 h-3 mr-1" />
                18+ Only
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              Playing <strong>{gameName}</strong> with SweepsCoins
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Warning Notice */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                    Important Sweepstakes Information
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    You are about to play with SweepsCoins which can be redeemed
                    for real cash prizes. Please read and accept the terms
                    below.
                  </p>
                </div>
              </div>
            </div>

            {/* Terms Content */}
            <ScrollArea className="h-64 w-full border rounded-lg p-4 bg-muted/30">
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-primary mb-2">
                    🎯 Sweepstakes Rules
                  </h4>
                  <ul className="space-y-1 text-muted-foreground pl-4">
                    <li>• Must be 18+ years old to participate</li>
                    <li>• Valid in eligible US states only</li>
                    <li>• SweepsCoins can be redeemed for cash prizes</li>
                    <li>• Minimum redemption amount applies</li>
                    <li>• Verification required for all redemptions</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-2">
                    💰 Prize Redemption
                  </h4>
                  <ul className="space-y-1 text-muted-foreground pl-4">
                    <li>• Minimum 50 SweepsCoins required for redemption</li>
                    <li>
                      • Identity verification required for first redemption
                    </li>
                    <li>• Processing time: 3-7 business days</li>
                    <li>• Subject to applicable taxes and regulations</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-2">
                    🛡️ Legal Compliance
                  </h4>
                  <ul className="space-y-1 text-muted-foreground pl-4">
                    <li>• Licensed and regulated sweepstakes platform</li>
                    <li>• Fair play guaranteed with certified RNG</li>
                    <li>• Responsible gaming tools available</li>
                    <li>• No purchase necessary to obtain SweepsCoins</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-2">
                    📍 Geographic Restrictions
                  </h4>
                  <p className="text-muted-foreground">
                    Sweepstakes not available in Nevada, Washington, and Idaho.
                    Full terms and conditions available on our website.
                  </p>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                  <p className="text-sm font-medium">
                    🎮 <strong>CoinKrazy.com Social Casino:</strong> This is a
                    sweepstakes-based social casino platform where virtual
                    currency can be redeemed for real prizes. Play responsibly
                    and within your means.
                  </p>
                </div>
              </div>
            </ScrollArea>

            {/* Checkboxes */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="read-terms"
                  checked={hasRead}
                  onCheckedChange={(checked) => setHasRead(checked as boolean)}
                />
                <label htmlFor="read-terms" className="text-sm leading-5">
                  <CheckCircle className="inline w-4 h-4 mr-1 text-green-600" />
                  I have read and understand the sweepstakes terms and
                  conditions
                </label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agree-terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) =>
                    setAgreedToTerms(checked as boolean)
                  }
                />
                <label htmlFor="agree-terms" className="text-sm leading-5">
                  <Shield className="inline w-4 h-4 mr-1 text-blue-600" />I
                  agree to the sweepstakes terms and conditions
                </label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="confirm-age"
                  checked={confirmedAge}
                  onCheckedChange={(checked) =>
                    setConfirmedAge(checked as boolean)
                  }
                />
                <label htmlFor="confirm-age" className="text-sm leading-5">
                  <Crown className="inline w-4 h-4 mr-1 text-yellow-600" />I
                  confirm that I am 18+ years old and in an eligible location
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 border-t border-border">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button
                className={`flex-1 font-bold ${
                  canProceed
                    ? "bg-green-600 hover:bg-green-700 casino-pulse"
                    : "bg-muted cursor-not-allowed"
                }`}
                onClick={handleAccept}
                disabled={!canProceed}
              >
                {canProceed ? (
                  <>
                    <Star className="w-4 h-4 mr-2" />
                    Accept & Play with SweepsCoins!
                  </>
                ) : (
                  "Please accept all terms"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
