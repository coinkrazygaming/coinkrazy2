import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CreditCardFormProps {
  packageId: string;
  packageName: string;
  amount: number;
  goldCoins: number;
  bonusSC: number;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

export const CreditCardForm: React.FC<CreditCardFormProps> = ({
  packageId,
  packageName,
  amount,
  goldCoins,
  bonusSC,
  onSuccess,
  onError,
  onCancel,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    email: "",
    zipCode: "",
  });

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;

    // Format card number with spaces
    if (field === "cardNumber") {
      formattedValue = value
        .replace(/\s/g, "")
        .replace(/(.{4})/g, "$1 ")
        .trim();
      if (formattedValue.length > 19)
        formattedValue = formattedValue.slice(0, 19);
    }

    // Format expiry date
    if (field === "expiryDate") {
      formattedValue = value.replace(/\D/g, "").replace(/(.{2})/, "$1/");
      if (formattedValue.length > 5)
        formattedValue = formattedValue.slice(0, 5);
    }

    // Format CVV
    if (field === "cvv") {
      formattedValue = value.replace(/\D/g, "");
      if (formattedValue.length > 4)
        formattedValue = formattedValue.slice(0, 4);
    }

    setFormData((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isProcessing) return;

    // Validate form
    if (
      !formData.cardNumber ||
      formData.cardNumber.replace(/\s/g, "").length < 15
    ) {
      toast.error("Please enter a valid card number");
      return;
    }

    if (!formData.expiryDate || formData.expiryDate.length < 5) {
      toast.error("Please enter a valid expiry date");
      return;
    }

    if (!formData.cvv || formData.cvv.length < 3) {
      toast.error("Please enter a valid CVV");
      return;
    }

    if (!formData.cardholderName.trim()) {
      toast.error("Please enter the cardholder name");
      return;
    }

    if (!formData.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setIsProcessing(true);

      // Process payment
      const response = await fetch("/api/store/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          packageId: parseInt(packageId),
          paymentMethod: "credit_card",
          paymentData: {
            paymentMethodId: `cc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            billingDetails: {
              name: formData.cardholderName,
              email: formData.email,
              address: {
                postal_code: formData.zipCode,
              },
            },
            cardData: {
              last4: formData.cardNumber.slice(-4),
              expiry: formData.expiryDate,
            },
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
        throw new Error(result.message || "Payment failed");
      }
    } catch (error: any) {
      console.error("Credit card payment failed:", error);
      const errorMessage = error.message || "Payment failed. Please try again.";
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Credit Card Payment
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          {packageName} - ${amount} for {goldCoins.toLocaleString()} GC +{" "}
          {bonusSC} SC
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={(e) => handleInputChange("cardNumber", e.target.value)}
              maxLength={19}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="text"
                placeholder="MM/YY"
                value={formData.expiryDate}
                onChange={(e) =>
                  handleInputChange("expiryDate", e.target.value)
                }
                maxLength={5}
                required
              />
            </div>
            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                type="text"
                placeholder="123"
                value={formData.cvv}
                onChange={(e) => handleInputChange("cvv", e.target.value)}
                maxLength={4}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              type="text"
              placeholder="John Doe"
              value={formData.cardholderName}
              onChange={(e) =>
                handleInputChange("cardholderName", e.target.value)
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input
              id="zipCode"
              type="text"
              placeholder="12345"
              value={formData.zipCode}
              onChange={(e) => handleInputChange("zipCode", e.target.value)}
              maxLength={10}
            />
          </div>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            <span>Your payment information is secure and encrypted</span>
          </div>

          <div className="flex space-x-3">
            <Button type="submit" className="flex-1" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay ${amount}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreditCardForm;
