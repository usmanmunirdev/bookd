import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plane,
  Hotel,
  UtensilsCrossed,
  Calendar,
  MoreVertical,
  Eye,
  Trash2,
} from "lucide-react";

interface BookingCardProps {
  booking: {
    id: string;
    type: "flight" | "hotel" | "dining" | "event";
    title: string;
    date: string;
    time: string;
    status: "confirmed" | "pending" | "cancelled";
    amount: string;
    destination?: string;
    services: string[];
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "bg-success text-success-foreground";
    case "pending":
      return "bg-warning text-warning-foreground";
    case "cancelled":
      return "bg-destructive text-destructive-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getServiceIcon = (type: string) => {
  switch (type) {
    case "flight":
      return <Plane className="w-4 h-4" />;
    case "hotel":
      return <Hotel className="w-4 h-4" />;
    case "dining":
      return <UtensilsCrossed className="w-4 h-4" />;
    case "event":
      return <Calendar className="w-4 h-4" />;
    default:
      return <Calendar className="w-4 h-4" />;
  }
};

const getServiceLabel = (type: string) => {
  switch (type) {
    case "flight":
      return "Flight";
    case "hotel":
      return "Hotel";
    case "dining":
      return "Dining";
    case "event":
      return "Event";
    default:
      return "Service";
  }
};

export const BookingCard = ({ booking }: BookingCardProps) => {
  return (
    <div className="bg-card border border-luxury-border rounded-lg p-4 hover:border-luxury-gold transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-10 h-10 bg-luxury-surface rounded-lg flex items-center justify-center text-luxury-gold">
            {getServiceIcon(booking.type)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-card-foreground truncate">
                {booking.title}
              </h3>
              <Badge className={`text-xs ${getStatusColor(booking.status)}`}>
                {booking.status}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-2">
              {booking.date} at {booking.time}
            </p>

            {booking.destination && (
              <p className="text-xs text-muted-foreground mb-2">
                {booking.destination}
              </p>
            )}

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-luxury-gold">
                {booking.amount}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">
                  {getServiceLabel(booking.type)}
                </span>
                {booking.services.length > 1 && (
                  <span className="text-xs text-muted-foreground">
                    +{booking.services.length - 1} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-popover border-luxury-border"
          >
            <DropdownMenuItem className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-4 h-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
