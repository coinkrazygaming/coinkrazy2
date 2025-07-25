import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import {
  Search,
  Filter,
  TrendingUp,
  Coins,
  X,
  SlidersHorizontal,
  Heart,
  Clock,
} from "lucide-react";

interface SlotFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
  selectedVolatility: string;
  onVolatilityChange: (volatility: string) => void;
  rtpRange: [number, number];
  onRtpRangeChange: (range: [number, number]) => void;
  betRange: [number, number];
  onBetRangeChange: (range: [number, number]) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

const providers = [
  "All Providers",
  "Pragmatic Play",
  "NetEnt",
  "Play'n GO",
  "Microgaming",
  "Red Tiger",
  "Yggdrasil",
  "Evolution",
];

const volatilities = ["All", "Low", "Medium", "High", "Very High"];

const sortOptions = [
  { value: "popular", label: "🔥 Most Popular", icon: TrendingUp },
  { value: "new", label: "🆕 Newest First", icon: Clock },
  { value: "rtp", label: "📈 Highest RTP", icon: TrendingUp },
  { value: "name", label: "🔤 A-Z", icon: Filter },
  { value: "jackpot", label: "💰 Biggest Jackpots", icon: Coins },
];

export default function SlotFilters({
  searchTerm,
  onSearchChange,
  selectedProvider,
  onProviderChange,
  selectedVolatility,
  onVolatilityChange,
  rtpRange,
  onRtpRangeChange,
  betRange,
  onBetRangeChange,
  onClearFilters,
  activeFiltersCount,
}: SlotFiltersProps) {
  const [sortBy, setSortBy] = useState("popular");
  const [showFavorites, setShowFavorites] = useState(false);
  const [showNewOnly, setShowNewOnly] = useState(false);

  return (
    <div className="space-y-4">
      {/* Search and Quick Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search slot games... 🔍"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant={showFavorites ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFavorites(!showFavorites)}
          >
            <Heart className="w-4 h-4 mr-2" />
            Favorites
          </Button>

          <Button
            variant={showNewOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowNewOnly(!showNewOnly)}
          >
            <Clock className="w-4 h-4 mr-2" />
            New Games
          </Button>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center">
                    <option.icon className="w-4 h-4 mr-2" />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Advanced Filters */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Advanced Filters
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2 bg-primary text-primary-foreground">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Advanced Filters</h4>
                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={onClearFilters}>
                      <X className="w-4 h-4 mr-1" />
                      Clear All
                    </Button>
                  )}
                </div>

                {/* Provider Filter */}
                <div className="space-y-2">
                  <Label>Game Provider</Label>
                  <Select
                    value={selectedProvider}
                    onValueChange={onProviderChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((provider) => (
                        <SelectItem key={provider} value={provider}>
                          {provider}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Volatility Filter */}
                <div className="space-y-2">
                  <Label>Volatility Level</Label>
                  <Select
                    value={selectedVolatility}
                    onValueChange={onVolatilityChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {volatilities.map((volatility) => (
                        <SelectItem key={volatility} value={volatility}>
                          {volatility === "All"
                            ? volatility
                            : `${volatility} Volatility`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* RTP Range */}
                <div className="space-y-2">
                  <Label>RTP Range (%)</Label>
                  <div className="px-2">
                    <Slider
                      value={rtpRange}
                      onValueChange={(value) =>
                        onRtpRangeChange(value as [number, number])
                      }
                      min={90}
                      max={99}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>{rtpRange[0]}%</span>
                      <span>{rtpRange[1]}%</span>
                    </div>
                  </div>
                </div>

                {/* Bet Range */}
                <div className="space-y-2">
                  <Label>Bet Range (GC)</Label>
                  <div className="px-2">
                    <Slider
                      value={betRange}
                      onValueChange={(value) =>
                        onBetRangeChange(value as [number, number])
                      }
                      min={0.1}
                      max={500}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>{betRange[0]} GC</span>
                      <span>{betRange[1]} GC</span>
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {selectedProvider !== "All Providers" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Provider: {selectedProvider}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => onProviderChange("All Providers")}
              />
            </Badge>
          )}
          {selectedVolatility !== "All" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Volatility: {selectedVolatility}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => onVolatilityChange("All")}
              />
            </Badge>
          )}
          {(rtpRange[0] !== 90 || rtpRange[1] !== 99) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              RTP: {rtpRange[0]}%-{rtpRange[1]}%
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => onRtpRangeChange([90, 99])}
              />
            </Badge>
          )}
          {showFavorites && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Favorites Only
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => setShowFavorites(false)}
              />
            </Badge>
          )}
          {showNewOnly && (
            <Badge variant="secondary" className="flex items-center gap-1">
              New Games Only
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => setShowNewOnly(false)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
