import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import CasinoHeader from "@/components/CasinoHeader";
import GooglePayButton, {
  FallbackPaymentButton,
} from "@/components/GooglePayButton";
import PayPalButton from "@/components/PayPalButton";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Coins,
  CreditCard,
  Gift,
  Star,
  Crown,
  Zap,
  Shield,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Clock,
  RefreshCw,
} from "lucide-react";

export default function GoldStore() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [storePackages, setStorePackages] = useState<any[]>([]);
  const [userPurchases, setUserPurchases] = useState<any[]>([]);
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(false);
  const { user } = useAuth();

  const goldCoinPackages = [
    {
      id: "1",
      name: "🌟 Starter Pack",
      goldCoins: 5000,
      price: 4.99,
      bonusSC: 5,
      popular: false,
      savings: 0,
      description: "Perfect for new players!",
      features: ["5,000 Gold Coins", "5 SC Bonus", "Instant Delivery"],
    },
    {
      id: "2",
      name: "🔥 Popular Pack",
      goldCoins: 15000,
      price: 9.99,
      bonusSC: 15,
      popular: true,
      savings: 20,
      description: "Most chosen by players!",
      features: [
        "15,000 Gold Coins",
        "15 SC Bonus",
        "VIP Support Priority",
        "Instant Delivery",
      ],
    },
    {
      id: "3",
      name: "💎 Value Pack",
      goldCoins: 30000,
      price: 19.99,
      bonusSC: 35,
      popular: false,
      savings: 25,
      description: "Great value for money!",
      features: [
        "30,000 Gold Coins",
        "35 SC Bonus",
        "VIP Support Priority",
        "Exclusive Badges",
        "Instant Delivery",
      ],
    },
    {
      id: "4",
      name: "👑 VIP Pack",
      goldCoins: 50000,
      price: 29.99,
      bonusSC: 60,
      popular: false,
      savings: 35,
      description: "Maximum value package!",
      features: [
        "50,000 Gold Coins",
        "60 SC Bonus",
        "VIP Support Priority",
        "Exclusive Badges",
        "Monthly Bonus",
        "Instant Delivery",
      ],
    },
    {
      id: "5",
      name: "���� Mega Pack",
      goldCoins: 100000,
      price: 49.99,
      bonusSC: 125,
      popular: false,
      savings: 45,
      description: "For serious players!",
      features: [
        "100,000 Gold Coins",
        "125 SC Bonus",
        "VIP Support Priority",
        "Exclusive Badges",
        "Monthly Bonus",
        "Special Events Access",
        "Instant Delivery",
      ],
    },
    {
      id: "6",
      name: "💫 Ultimate Pack",
      goldCoins: 250000,
      price: 99.99,
      bonusSC: 300,
      popular: false,
      savings: 55,
      description: "The ultimate experience!",
      features: [
        "250,000 Gold Coins",
        "300 SC Bonus",
        "Platinum VIP Status",
        "Dedicated Support",
        "Exclusive Badges",
        "Weekly Bonuses",
        "Special Events Access",
        "Custom Avatar",
        "Instant Delivery",
      ],
    },
  ];

  // Load store packages and user's purchase history
  useEffect(() => {
    loadStorePackages();
    if (user) {
      loadPurchaseHistory();
    }
  }, [user]);

  const loadStorePackages = async () => {
    try {
      const response = await fetch("/api/store/packages");
      if (response.ok) {
        const data = await response.json();
        const packages = data.packages.map((pkg: any) => ({
          id: pkg.id.toString(),
          name: pkg.name,
          goldCoins: pkg.gold_coins,
          price: pkg.price,
          bonusSC: pkg.bonus_sweeps_coins,
          popular: pkg.package_type === "standard" || pkg.is_featured,
          savings:
            pkg.package_type === "premium"
              ? 25
              : pkg.package_type === "vip"
                ? 35
                : pkg.package_type === "mega"
                  ? 45
                  : pkg.package_type === "ultimate"
                    ? 55
                    : 0,
          description: pkg.description,
          features: [
            `${pkg.gold_coins.toLocaleString()} Gold Coins`,
            `${pkg.bonus_sweeps_coins} SC Bonus`,
            pkg.package_type === "vip" ||
            pkg.package_type === "mega" ||
            pkg.package_type === "ultimate"
              ? "VIP Support Priority"
              : "Standard Support",
            pkg.package_type === "ultimate"
              ? "Platinum VIP Status"
              : pkg.package_type === "vip" || pkg.package_type === "mega"
                ? "VIP Status"
                : "Regular Member",
            "Instant Delivery",
          ].filter(Boolean),
        }));
        setStorePackages(packages);
      } else {
        // Fallback to hardcoded packages if API fails
        setStorePackages(goldCoinPackages);
      }
    } catch (error) {
      console.error("Failed to load store packages:", error);
      // Fallback to hardcoded packages
      setStorePackages(goldCoinPackages);
    }
  };

  const loadPurchaseHistory = async () => {
    try {
      setIsLoadingPurchases(true);
      const response = await fetch("/api/store/purchases", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserPurchases(data.purchases || []);
      }
    } catch (error) {
      console.error("Failed to load purchase history:", error);
    } finally {
      setIsLoadingPurchases(false);
    }
  };

  const handlePurchaseSuccess = async (result: any) => {
    // Refresh user's balance and purchase history
    await loadPurchaseHistory();

    // You might want to refresh the user's coin balance here
    toast.success(
      `🎉 Purchase completed! ${result.goldCoinsReceived?.toLocaleString()} GC + ${result.sweepsCoinsReceived} SC added to your account!`,
    );
  };

  const handlePurchaseError = (error: string) => {
    toast.error(`Payment failed: ${error}`);
  };

  const handleFallbackPurchase = async (pkg: any) => {
    setSelectedPackage(pkg.id);
    setIsProcessing(true);

    try {
      // This would integrate with other payment methods
      toast.info("Alternative payment methods coming soon!");
    } catch (error) {
      toast.error("Payment processing failed");
    } finally {
      setIsProcessing(false);
      setSelectedPackage(null);
    }
  };

  // Format user purchases for display
  const recentPurchases = userPurchases.slice(0, 5).map((purchase) => ({
    package: purchase.package_name,
    date: new Date(purchase.created_at).toLocaleString(),
    amount: `$${purchase.amount}`,
    goldCoins: purchase.gold_coins_received,
    bonusSC: purchase.sweeps_coins_received,
  }));

  const specialOffers = [
    {
      title: "🎄 Holiday Special",
      description: "Double SC bonus on all packages!",
      expiry: "Dec 31, 2024",
      active: true,
    },
    {
      title: "🎯 Weekend Warrior",
      description: "20% extra GC on weekends",
      expiry: "Every Weekend",
      active: true,
    },
    {
      title: "👑 VIP Loyalty",
      description: "Extra bonuses for VIP members",
      expiry: "Ongoing",
      active: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <CasinoHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Store Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center">
            <Coins className="w-10 h-10 mr-3 text-primary" />
            💰 CoinKrazy Gold Store
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            Purchase Gold Coins and get FREE Sweepstakes Cash! 🎁
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Badge className="bg-green-500 text-white px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              🔒 Secure Payments
            </Badge>
            <Badge className="bg-accent text-accent-foreground px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />⚡ Instant Delivery
            </Badge>
            <Badge className="bg-primary text-primary-foreground px-4 py-2">
              <Gift className="w-4 h-4 mr-2" />
              🎁 FREE SC Bonus
            </Badge>
          </div>
        </div>

        {/* Special Offers Banner */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-primary/20 to-accent/20 border-primary casino-glow">
            <CardContent className="p-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-primary mb-2">
                  🎄 Holiday Special - Double SC Bonus! 🎁
                </h2>
                <p className="text-muted-foreground mb-4">
                  Get DOUBLE the Sweepstakes Cash bonus on all packages until
                  December 31st!
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-accent" />
                    <span className="text-sm">Limited Time Only</span>
                  </div>
                  <div className="flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 text-primary" />
                    <span className="text-sm">Auto-Applied</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Package Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {storePackages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`casino-glow transition-all duration-300 hover:scale-105 relative ${
                pkg.popular
                  ? "ring-2 ring-primary shadow-xl"
                  : "hover:shadow-xl"
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1 text-sm">
                    ⭐ MOST POPULAR
                  </Badge>
                </div>
              )}

              {pkg.savings > 0 && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-green-500 text-white">
                    💰 {pkg.savings}% OFF
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-xl text-primary mb-2">
                  {pkg.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {pkg.description}
                </p>
                <div className="text-4xl font-bold text-primary mt-4">
                  ${pkg.price}
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Main Features */}
                  <div className="text-center space-y-2">
                    <div className="bg-secondary p-3 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {pkg.goldCoins.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        💰 Gold Coins
                      </div>
                    </div>
                    <div className="bg-accent/20 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-accent">
                        +{pkg.bonusSC}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ✨ SC Bonus
                      </div>
                    </div>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-1 text-sm">
                    {pkg.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center text-muted-foreground"
                      >
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Google Pay Button */}
                  <div className="space-y-2">
                    <GooglePayButton
                      packageId={pkg.id}
                      packageName={pkg.name}
                      amount={pkg.price}
                      goldCoins={pkg.goldCoins}
                      bonusSC={pkg.bonusSC}
                      onSuccess={handlePurchaseSuccess}
                      onError={handlePurchaseError}
                      disabled={isProcessing && selectedPackage === pkg.id}
                      className={pkg.popular ? "casino-pulse" : ""}
                    />

                    {/* PayPal Button */}
                    <PayPalButton
                      packageId={pkg.id}
                      packageName={pkg.name}
                      amount={pkg.price}
                      goldCoins={pkg.goldCoins}
                      bonusSC={pkg.bonusSC}
                      onSuccess={handlePurchaseSuccess}
                      onError={handlePurchaseError}
                      disabled={isProcessing && selectedPackage === pkg.id}
                    />

                    {/* Fallback payment button */}
                    <FallbackPaymentButton
                      packageId={pkg.id}
                      packageName={pkg.name}
                      amount={pkg.price}
                      goldCoins={pkg.goldCoins}
                      bonusSC={pkg.bonusSC}
                      onSuccess={handlePurchaseSuccess}
                      onError={handlePurchaseError}
                      disabled={isProcessing}
                      className="text-sm py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                    />
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    🔒 Secure payment • Instant delivery • 24/7 support
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Information */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* How It Works */}
          <Card className="casino-glow">
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <TrendingUp className="w-5 h-5 mr-2" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold">Choose Package</h3>
                    <p className="text-sm text-muted-foreground">
                      Select the perfect Gold Coin package for you
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold">Secure Payment</h3>
                    <p className="text-sm text-muted-foreground">
                      Pay safely with Google Pay
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold">Instant Delivery</h3>
                    <p className="text-sm text-muted-foreground">
                      Coins + SC bonus added immediately
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Purchases */}
          <Card className="casino-glow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-accent">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Purchase History
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadPurchaseHistory}
                  disabled={isLoadingPurchases}
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isLoadingPurchases ? "animate-spin" : ""}`}
                  />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isLoadingPurchases ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Loading purchases...
                    </p>
                  </div>
                ) : recentPurchases.length > 0 ? (
                  recentPurchases.map((purchase, index) => (
                    <div
                      key={index}
                      className="p-3 bg-secondary rounded-lg space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">
                          {purchase.package}
                        </h3>
                        <span className="text-sm font-bold text-primary">
                          {purchase.amount}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {purchase.date}
                      </p>
                      <div className="text-xs">
                        <span className="text-primary">
                          {purchase.goldCoins?.toLocaleString()} GC
                        </span>{" "}
                        +{" "}
                        <span className="text-accent">
                          {purchase.bonusSC} SC
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No purchases yet. Start playing! 🎮
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Special Offers */}
          <Card className="casino-glow">
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <Sparkles className="w-5 h-5 mr-2" />
                Active Promotions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {specialOffers.map((offer, index) => (
                  <div
                    key={index}
                    className="p-3 bg-accent/10 rounded-lg border border-accent/20"
                  >
                    <h3 className="font-semibold text-accent text-sm">
                      {offer.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {offer.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        Until: {offer.expiry}
                      </span>
                      <Badge
                        className={`text-xs ${
                          offer.active
                            ? "bg-green-500 text-white"
                            : "bg-gray-500 text-white"
                        }`}
                      >
                        {offer.active ? "🟢 ACTIVE" : "🔴 EXPIRED"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="font-semibold text-primary mb-4">
              🔒 Safe & Secure Payments
            </h3>
            <div className="grid md:grid-cols-4 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center justify-center">
                <Shield className="w-4 h-4 mr-2 text-green-500" />
                SSL Encrypted
              </div>
              <div className="flex items-center justify-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Google Pay Verified
              </div>
              <div className="flex items-center justify-center">
                <Zap className="w-4 h-4 mr-2 text-accent" />
                Instant Delivery
              </div>
              <div className="flex items-center justify-center">
                <Crown className="w-4 h-4 mr-2 text-primary" />
                24/7 Support
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              🎮 Gold Coins have no cash value and are for entertainment only •
              🏆 Sweepstakes Cash can be redeemed for prizes • 🔞 18+ Only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
