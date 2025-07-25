import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface PayPalButtonProps {
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

declare global {
  interface Window {
    paypal?: {
      Buttons: (options: any) => {
        render: (selector: string) => Promise<void>;
      };
    };
  }
}

export const PayPalButton: React.FC<PayPalButtonProps> = ({
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
  const [paypalAvailable, setPaypalAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paypalButtonRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    initializePayPal();
  }, []);

  const initializePayPal = async () => {
    try {
      setIsLoading(true);

      // Load PayPal SDK if not already loaded
      if (!window.paypal) {
        await loadPayPalScript();
      }

      // Double-check that PayPal is available
      if (window.paypal && paypalButtonRef.current) {
        setIsInitialized(true);
        setPaypalAvailable(true);
        await createPayPalButton();
      } else {
        setPaypalAvailable(false);
        setError("PayPal is not available on this device");
      }
    } catch (error: any) {
      console.warn(
        "PayPal initialization failed (this is normal if not supported):",
        error,
      );
      setError(error.message || "Failed to initialize PayPal");
      setPaypalAvailable(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPayPalScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if PayPal is already loaded
      if (window.paypal) {
        resolve();
        return;
      }

      // Check if script is already in DOM
      const existingScript = document.querySelector(
        'script[src*="paypal.com"]',
      );
      if (existingScript) {
        // Script exists but may not be loaded yet, wait for it
        const checkLoaded = () => {
          if (window.paypal) {
            resolve();
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        setTimeout(checkLoaded, 100);
        return;
      }

      const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

      // If no client ID is provided, reject immediately
      if (!clientId || clientId === "test") {
        reject(new Error("PayPal client ID not configured"));
        return;
      }

      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
      script.async = true;
      script.crossOrigin = "anonymous";

      script.onload = () => {
        // Wait a bit for PayPal to be available
        const checkAPI = () => {
          if (window.paypal) {
            resolve();
          } else {
            setTimeout(() => {
              if (window.paypal) {
                resolve();
              } else {
                reject(new Error("PayPal API not available after script load"));
              }
            }, 500);
          }
        };
        setTimeout(checkAPI, 100);
      };

      script.onerror = (error) => {
        console.warn("PayPal script failed to load:", error);
        reject(
          new Error(
            "Failed to load PayPal script - script may be blocked or client ID invalid",
          ),
        );
      };

      document.head.appendChild(script);

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!window.paypal) {
          reject(new Error("PayPal script loading timeout"));
        }
      }, 10000);
    });
  };

  const createPayPalButton = async () => {
    if (!paypalButtonRef.current || !window.paypal) return;

    try {
      const paypalButtons = window.paypal.Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: amount.toFixed(2),
                  currency_code: "USD",
                },
                description: `${packageName} - ${goldCoins.toLocaleString()} GC + ${bonusSC} SC`,
              },
            ],
          });
        },
        onApprove: async (data: any, actions: any) => {
          try {
            const order = await actions.order.capture();
            await handlePaymentSuccess(order);
          } catch (error) {
            console.error("PayPal capture error:", error);
            handlePaymentError("Payment capture failed");
          }
        },
        onError: (err: any) => {
          console.error("PayPal error:", err);
          handlePaymentError("PayPal payment failed");
        },
        onCancel: (data: any) => {
          console.log("PayPal payment cancelled:", data);
          toast.info("Payment was cancelled");
        },
      });

      await paypalButtons.render(paypalButtonRef.current as any);
    } catch (error) {
      console.error("Failed to create PayPal button:", error);
      setError("Failed to create payment button");
    }
  };

  const handlePaymentSuccess = async (order: any) => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/store/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          packageId: parseInt(packageId),
          paymentMethod: "paypal",
          paymentData: {
            paymentMethodId: order.id,
            billingDetails: order.payer,
            email: order.payer?.email_address,
            orderData: order,
          },
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          `🎉 Purchase successful! You received ${goldCoins.toLocaleString()} GC + ${bonusSC} SC!`,
        );
        onSuccess?.(result);
      } else {
        throw new Error(result.message || "Payment processing failed");
      }
    } catch (error: any) {
      console.error("Payment processing failed:", error);
      const errorMessage = error.message || "Payment processing failed";
      handlePaymentError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
    toast.error(errorMessage);
    onError?.(errorMessage);
  };

  const handleFallbackClick = () => {
    toast.info(
      "💳 PayPal not available. Try Google Pay above or contact support for help.",
    );
  };

  // Show loading state
  if (isLoading && !isInitialized) {
    return (
      <Button disabled className={`w-full ${className}`}>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading PayPal...
      </Button>
    );
  }

  // Show error state with fallback
  if (!paypalAvailable || error) {
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

  // Show PayPal button
  return (
    <div className={`w-full ${className}`}>
      <div
        ref={paypalButtonRef}
        className="w-full min-h-[45px] flex items-center justify-center"
      />
      {error && (
        <p className="text-xs text-red-500 mt-2 text-center">{error}</p>
      )}
    </div>
  );
};

export default PayPalButton;
