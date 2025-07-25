import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, AlertCircle } from "lucide-react";
import { googlePayService } from "@/services/googlePay";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import CreditCardForm from "./CreditCardForm";

interface GooglePayButtonProps {
  packageId: string;
  packageName: string;
  amount: number;
  goldCoins: number;
  bonusSC: number;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export const GooglePayButton: React.FC<GooglePayButtonProps> = ({
  packageId,
  packageName,
  amount,
  goldCoins,
  bonusSC,
  onSuccess,
  onError,
  disabled = false,
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [googlePayAvailable, setGooglePayAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const googlePayButtonRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    initializeGooglePay();
  }, []);

  const initializeGooglePay = async () => {
    try {
      setIsLoading(true);
      const initialized = await googlePayService.initialize();

      if (initialized) {
        setIsInitialized(true);
        setGooglePayAvailable(true);
        await createGooglePayButton();
      } else {
        setGooglePayAvailable(false);
        setError("Google Pay not supported");
      }
    } catch (error: any) {
      console.warn(
        "Google Pay initialization failed (this is normal if not supported):",
        error,
      );
      setError("Google Pay unavailable");
      setGooglePayAvailable(false);
    } finally {
      setIsLoading(false);
    }
  };

  const createGooglePayButton = async () => {
    if (!googlePayButtonRef.current || !isInitialized) return;

    try {
      const button = await googlePayService.createButton(handleGooglePayClick, {
        buttonColor: "default",
        buttonType: "long",
        buttonSizeMode: "fill",
      });

      if (button && googlePayButtonRef.current) {
        // Clear any existing content
        googlePayButtonRef.current.innerHTML = "";
        googlePayButtonRef.current.appendChild(button);
      } else {
        setError("Unable to create Google Pay button");
        setGooglePayAvailable(false);
      }
    } catch (error: any) {
      console.warn("Failed to create Google Pay button:", error);
      setError("Google Pay button unavailable");
      setGooglePayAvailable(false);
    }
  };

  const handleGooglePayClick = async () => {
    if (!user) {
      toast.error("Please log in to make a purchase");
      return;
    }

    if (disabled || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);

      // Request payment from Google Pay
      const paymentData = await googlePayService.requestPayment(
        amount,
        `${packageName} - ${goldCoins.toLocaleString()} GC + ${bonusSC} SC`,
      );

      if (!paymentData) {
        throw new Error("Payment was cancelled");
      }

      // Process the payment with our backend
      const result = await googlePayService.processPayment(
        packageId,
        paymentData,
      );

      if (result.success) {
        toast.success(
          `🎉 Purchase successful! You received ${goldCoins.toLocaleString()} GC + ${bonusSC} SC!`,
        );
        onSuccess?.(result.data);
      } else {
        throw new Error(result.error || "Payment processing failed");
      }
    } catch (error: any) {
      console.error("Payment failed:", error);
      const errorMessage = error.message || "Payment failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFallbackClick = () => {
    toast.info(
      "💳 Google Pay not available. Try PayPal below or contact support for help.",
    );
  };

  // Show loading state
  if (isLoading && !isInitialized) {
    return (
      <Button disabled className={`w-full ${className}`}>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Initializing Payment...
      </Button>
    );
  }

  // Show error state with fallback
  if (!googlePayAvailable || error) {
    return (
      <Button
        onClick={handleFallbackClick}
        variant="outline"
        className={`w-full ${className}`}
        disabled={disabled}
      >
        <CreditCard className="w-4 h-4 mr-2" />
        💳 Alternative Payment
      </Button>
    );
  }

  // Show processing state
  if (isLoading) {
    return (
      <Button disabled className={`w-full ${className}`}>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Processing Payment...
      </Button>
    );
  }

  // Show Google Pay button
  return (
    <div className={`w-full ${className}`}>
      <div
        ref={googlePayButtonRef}
        className="w-full min-h-[48px] flex items-center justify-center"
        style={{
          minHeight: "48px",
        }}
      />
      {error && (
        <p className="text-xs text-red-500 mt-2 text-center">{error}</p>
      )}
    </div>
  );
};

// Fallback button for when Google Pay is not available
export const FallbackPaymentButton: React.FC<{
  packageId: string;
  packageName: string;
  amount: number;
  goldCoins: number;
  bonusSC: number;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}> = ({
  packageId,
  packageName,
  amount,
  goldCoins,
  bonusSC,
  onSuccess,
  onError,
  disabled = false,
  className = "",
}) => {
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return (
      <CreditCardForm
        packageId={packageId}
        packageName={packageName}
        amount={amount}
        goldCoins={goldCoins}
        bonusSC={bonusSC}
        onSuccess={(result) => {
          setShowForm(false);
          onSuccess?.(result);
        }}
        onError={(error) => {
          onError?.(error);
        }}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  return (
    <Button
      onClick={() => setShowForm(true)}
      className={`w-full bg-primary hover:bg-primary/90 ${className}`}
      disabled={disabled}
    >
      <CreditCard className="w-4 h-4 mr-2" />
      💳 Pay with Credit Card
    </Button>
  );
};

export default GooglePayButton;
