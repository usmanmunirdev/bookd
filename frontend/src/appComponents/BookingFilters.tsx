
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Filter, DollarSign, MapPin } from "lucide-react";

interface BookingFiltersProps {
  onFilterChange: (filters: any) => void;
}

export const BookingFilters = ({ onFilterChange }: BookingFiltersProps) => {
  return (
    <div className="bg-card border border-luxury-border rounded-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-luxury-gold" />
        <h3 className="text-sm font-medium text-card-foreground">
          Filter Bookings
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Service Type
          </Label>
          <Select
            onValueChange={(value) => onFilterChange({ serviceType: value })}
          >
            <SelectTrigger className="bg-luxury-surface border-luxury-border">
              <SelectValue placeholder="All Services" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-luxury-border">
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="flights">Flights</SelectItem>
              <SelectItem value="hotels">Hotels</SelectItem>
              <SelectItem value="dining">Dining</SelectItem>
              <SelectItem value="events">Events</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            Price Range
          </Label>
          <Select
            onValueChange={(value) => onFilterChange({ priceRange: value })}
          >
            <SelectTrigger className="bg-luxury-surface border-luxury-border">
              <SelectValue placeholder="Any Price" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-luxury-border">
              <SelectItem value="all">Any Price</SelectItem>
              <SelectItem value="0-1000">$0 - $1,000</SelectItem>
              <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
              <SelectItem value="5000-15000">$5,000 - $15,000</SelectItem>
              <SelectItem value="15000+">$15,000+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            Destination
          </Label>
          <Input
            placeholder="Enter destination..."
            className="bg-luxury-surface border-luxury-border focus:ring-luxury-gold"
            onChange={(e) => onFilterChange({ destination: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Date Range
          </Label>
          <Select
            onValueChange={(value) => onFilterChange({ dateRange: value })}
          >
            <SelectTrigger className="bg-luxury-surface border-luxury-border">
              <SelectValue placeholder="All Dates" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-luxury-border">
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
