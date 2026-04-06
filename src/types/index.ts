export interface Raffle {
  id: string;
  title: string;
  description: string | null;
  total_tickets: number;
  price_per_ticket: number;
  tickets_sold: number;
  status: 'active' | 'closed' | 'drawn';
  created_at: string;
  drawn_at: string | null;
  winning_ticket_number: number | null;
}

export interface Ticket {
  id: string;
  raffle_id: string;
  ticket_number: number;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  purchased_at: string;
}

export interface RaffleWithTickets extends Raffle {
  tickets: Ticket[];
}
