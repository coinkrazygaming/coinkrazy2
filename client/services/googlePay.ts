interface GooglePayConfig {
  environment: "TEST" | "PRODUCTION";
  merchantId: string;
  merchantName: string;
  baseCardPaymentMethod: {
    type: "CARD";
    parameters: {
      allowedCardNetworks: (
        | "AMEX"
        | "DISCOVER"
        | "INTERAC"
        | "JCB"
        | "MASTERCARD"
        | "VISA"
      )[];
      allowedAuthMethods: ("PAN_ONLY" | "CRYPTOGRAM_3DS")[];
      billingAddressRequired?: boolean;
      billingAddressParameters?: {
        format: "FULL" | "MIN";
        phoneNumberRequired?: boolean;
      };
    };
  };
  tokenizationSpecification: {
    type: "PAYMENT_GATEWAY";
    parameters: {
      gateway: string;
      gatewayMerchantId?: string;
    };
  };
}

interface PaymentDataRequest {
  apiVersion: number;
  apiVersionMinor: number;
  allowedPaymentMethods: PaymentMethod[];
  merchantInfo: {
    merchantId: string;
    merchantName: string;
  };
  transactionInfo: {
    displayItems?: DisplayItem[];
    countryCode: string;
    currencyCode: string;
    totalPriceStatus: "FINAL" | "ESTIMATED";
    totalPrice: string;
    totalPriceLabel?: string;
  };
  callbackIntents?: "PAYMENT_AUTHORIZATION"[];
  shippingAddressRequired?: boolean;
  emailRequired?: boolean;
}

interface PaymentMethod {
  type: "CARD";
  parameters: {
    allowedCardNetworks: string[];
    allowedAuthMethods: string[];
    billingAddressRequired?: boolean;
    billingAddressParameters?: {
      format: "FULL" | "MIN";
      phoneNumberRequired?: boolean;
    };
  };
  tokenizationSpecification: {
    type: "PAYMENT_GATEWAY";
    parameters: {
      gateway: string;
      gatewayMerchantId?: string;
    };
  };
}

interface DisplayItem {
  label: string;
  price: string;
  type: "LINE_ITEM" | "SUBTOTAL" | "TAX";
}

interface PaymentData {
  apiVersion: number;
  apiVersionMinor: number;
  paymentMethodData: {
    description: string;
    info: {
      billingAddress?: {
        address1: string;
        address2?: string;
        address3?: string;
        administrativeArea: string;
        countryCode: string;
        locality: string;
        name: string;
        phoneNumber?: string;
        postalCode: string;
        sortingCode?: string;
      };
      cardDetails: string;
      cardNetwork: string;
    };
    tokenizationData: {
      token: string;
      type: "PAYMENT_GATEWAY";
    };
    type: "CARD";
  };
  email?: string;
  shippingAddress?: any;
}

declare global {
  interface Window {
    google?: {
      payments: {
        api: {
          PaymentsClient: new (options: {
            environment: "TEST" | "PRODUCTION";
            paymentDataCallbacks?: {
              onPaymentAuthorized: (paymentData: PaymentData) => Promise<{
                transactionState: "SUCCESS" | "ERROR";
                error?: {
                  reason: "PAYMENT_DATA_INVALID" | "OTHER_ERROR";
                  message: string;
                  intent: "PAYMENT_AUTHORIZATION";
                };
              }>;
            };
          }) => {
            isReadyToPay(request: {
              apiVersion: number;
              apiVersionMinor: number;
              allowedPaymentMethods: PaymentMethod[];
            }): Promise<{ result: boolean; paymentMethodPresent?: boolean }>;
            createButton(options: {
              onClick: () => void;
              buttonColor?: "default" | "black" | "white";
              buttonType?: "long" | "short";
              buttonSizeMode?: "static" | "fill";
            }): HTMLElement;
            loadPaymentData(
              paymentDataRequest: PaymentDataRequest,
            ): Promise<PaymentData>;
          };
        };
      };
    };
  }
}

export class GooglePayService {
  private paymentsClient: any;
  private isInitialized = false;
  private config: GooglePayConfig;

  constructor() {
    // Determine environment - use TEST for development and staging
    const isProduction =
      import.meta.env.MODE === "production" && import.meta.env.PROD;

    this.config = {
      environment: isProduction ? "PRODUCTION" : "TEST",
      merchantId:
        import.meta.env.VITE_GOOGLE_PAY_MERCHANT_ID || "BCR2DN4T2ZOYRS3O", // Test merchant ID
      merchantName: "CoinKrazy Casino",
      baseCardPaymentMethod: {
        type: "CARD",
        parameters: {
          allowedCardNetworks: [
            "AMEX",
            "DISCOVER",
            "JCB",
            "MASTERCARD",
            "VISA",
          ],
          allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
          billingAddressRequired: true,
          billingAddressParameters: {
            format: "FULL",
            phoneNumberRequired: true,
          },
        },
      },
      tokenizationSpecification: {
        type: "PAYMENT_GATEWAY",
        parameters: {
          gateway: "stripe",
          gatewayMerchantId:
            import.meta.env.VITE_STRIPE_MERCHANT_ID || "acct_test_123456789",
        },
      },
    };
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      // Load Google Pay API if not already loaded
      if (!window.google?.payments?.api) {
        await this.loadGooglePayScript();
      }

      // Double-check that the API is available
      if (!window.google?.payments?.api) {
        throw new Error("Google Pay API not available after script loading");
      }

      // Initialize payments client
      this.paymentsClient = new window.google.payments.api.PaymentsClient({
        environment: this.config.environment,
        paymentDataCallbacks: {
          onPaymentAuthorized: this.onPaymentAuthorized.bind(this),
        },
      });

      // Check if Google Pay is available
      const isReadyToPayRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [this.getCardPaymentMethod()],
      };

      const response =
        await this.paymentsClient.isReadyToPay(isReadyToPayRequest);

      if (response.result) {
        this.isInitialized = true;
        console.log("Google Pay initialized successfully");
        return true;
      } else {
        console.warn("Google Pay not available on this device/browser");
        return false;
      }
    } catch (error) {
      console.warn(
        "Google Pay initialization failed (this is normal if not supported):",
        error,
      );
      return false;
    }
  }

  private async loadGooglePayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if Google Pay is already loaded
      if (window.google?.payments?.api) {
        resolve();
        return;
      }

      // Check if script is already in DOM
      const existingScript = document.querySelector(
        'script[src*="pay.google.com"]',
      );
      if (existingScript) {
        // Script exists but may not be loaded yet, wait for it
        const checkLoaded = () => {
          if (window.google?.payments?.api) {
            resolve();
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        setTimeout(checkLoaded, 100);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://pay.google.com/gp/p/js/pay.js";
      script.async = true;
      script.crossOrigin = "anonymous";

      script.onload = () => {
        // Wait a bit for the Google Pay API to be available
        const checkAPI = () => {
          if (window.google?.payments?.api) {
            resolve();
          } else {
            // Retry a few times
            setTimeout(() => {
              if (window.google?.payments?.api) {
                resolve();
              } else {
                reject(
                  new Error("Google Pay API not available after script load"),
                );
              }
            }, 500);
          }
        };
        setTimeout(checkAPI, 100);
      };

      script.onerror = (error) => {
        console.warn("Google Pay script failed to load:", error);
        reject(
          new Error(
            "Failed to load Google Pay script - script may be blocked or unavailable",
          ),
        );
      };

      document.head.appendChild(script);

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!window.google?.payments?.api) {
          reject(new Error("Google Pay script loading timeout"));
        }
      }, 10000);
    });
  }

  private getCardPaymentMethod(): PaymentMethod {
    return {
      ...this.config.baseCardPaymentMethod,
      tokenizationSpecification: this.config.tokenizationSpecification,
    };
  }

  async createButton(
    onClick: () => void,
    options: {
      buttonColor?: "default" | "black" | "white";
      buttonType?: "long" | "short";
      buttonSizeMode?: "static" | "fill";
    } = {},
  ): Promise<HTMLElement | null> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        return null;
      }
    }

    try {
      return this.paymentsClient.createButton({
        onClick,
        buttonColor: options.buttonColor || "default",
        buttonType: options.buttonType || "long",
        buttonSizeMode: options.buttonSizeMode || "static",
      });
    } catch (error) {
      console.error("Failed to create Google Pay button:", error);
      return null;
    }
  }

  async requestPayment(
    amount: number,
    packageName: string,
  ): Promise<PaymentData | null> {
    if (!this.isInitialized) {
      throw new Error("Google Pay not initialized");
    }

    const paymentDataRequest: PaymentDataRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [this.getCardPaymentMethod()],
      merchantInfo: {
        merchantId: this.config.merchantId,
        merchantName: this.config.merchantName,
      },
      transactionInfo: {
        displayItems: [
          {
            label: packageName,
            price: amount.toFixed(2),
            type: "LINE_ITEM",
          },
        ],
        countryCode: "US",
        currencyCode: "USD",
        totalPriceStatus: "FINAL",
        totalPrice: amount.toFixed(2),
        totalPriceLabel: "Total",
      },
      callbackIntents: ["PAYMENT_AUTHORIZATION"],
      emailRequired: true,
    };

    try {
      return await this.paymentsClient.loadPaymentData(paymentDataRequest);
    } catch (error) {
      console.error("Payment request failed:", error);
      throw error;
    }
  }

  private async onPaymentAuthorized(paymentData: PaymentData): Promise<{
    transactionState: "SUCCESS" | "ERROR";
    error?: {
      reason: "PAYMENT_DATA_INVALID" | "OTHER_ERROR";
      message: string;
      intent: "PAYMENT_AUTHORIZATION";
    };
  }> {
    try {
      // Process the payment with your backend
      console.log("Payment authorized:", paymentData);

      // For now, just return success
      // In a real implementation, you would send this to your backend
      return {
        transactionState: "SUCCESS",
      };
    } catch (error) {
      console.error("Payment processing failed:", error);
      return {
        transactionState: "ERROR",
        error: {
          reason: "OTHER_ERROR",
          message: "Payment processing failed",
          intent: "PAYMENT_AUTHORIZATION",
        },
      };
    }
  }

  async processPayment(
    packageId: string,
    paymentData: PaymentData,
  ): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const response = await fetch("/api/store/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          packageId: parseInt(packageId),
          paymentMethod: "google_pay",
          paymentData: {
            paymentMethodId:
              paymentData.paymentMethodData.tokenizationData.token,
            billingDetails: paymentData.paymentMethodData.info.billingAddress,
            email: paymentData.email,
            paymentMethodData: paymentData.paymentMethodData,
          },
        }),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: result,
        };
      } else {
        return {
          success: false,
          error: result.message || "Payment failed",
        };
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      return {
        success: false,
        error: "Network error occurred",
      };
    }
  }

  isAvailable(): boolean {
    return this.isInitialized;
  }
}

export const googlePayService = new GooglePayService();
