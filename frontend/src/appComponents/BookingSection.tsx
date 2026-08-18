import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { BookingCard } from "./BookingCard";

interface BookingSectionProps {
  title: string;
  icon: React.ReactNode;
  bookings: any[];
  defaultOpen?: boolean;
}

export const BookingSection = ({ title, icon, bookings, defaultOpen = true }: BookingSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (bookings.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-between p-4 h-auto bg-luxury-surface border border-luxury-border rounded-lg hover:bg-luxury-border"
        >
          <div className="flex items-center gap-3">
            <div className="text-luxury-gold">{icon}</div>
            <span className="font-medium text-card-foreground">{title}</span>
            <span className="text-sm text-muted-foreground">({bookings.length})</span>
          </div>
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 pl-4">
        {bookings.map((booking, index) => (
          <BookingCard key={booking.id || index} booking={booking} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};