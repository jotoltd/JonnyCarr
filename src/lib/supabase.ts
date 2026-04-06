import { createClient } from '@supabase/supabase-js';
import type { Raffle, Ticket } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
const isConfigured = supabaseUrl && supabaseKey;

// Create client only if configured, otherwise use a dummy client
export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseKey)
  : createClient('http://localhost', 'dummy-key');

// Mock data for demo mode
let mockRaffles: Raffle[] = [];
let mockTickets: Ticket[] = [];
let mockIdCounter = 1;

// Raffle operations
export async function getActiveRaffles(): Promise<Raffle[]> {
  if (!isConfigured) {
    return mockRaffles.filter(r => r.status === 'active');
  }
  const { data, error } = await supabase
    .from('raffles')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getAllRaffles(): Promise<Raffle[]> {
  if (!isConfigured) {
    return [...mockRaffles];
  }
  const { data, error } = await supabase
    .from('raffles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getRaffleById(id: string): Promise<Raffle | null> {
  if (!isConfigured) {
    return mockRaffles.find(r => r.id === id) || null;
  }
  const { data, error } = await supabase
    .from('raffles')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createRaffle(raffle: Omit<Raffle, 'id' | 'created_at' | 'tickets_sold' | 'drawn_at' | 'winning_ticket_number'>): Promise<Raffle> {
  if (!isConfigured) {
    const newRaffle: Raffle = {
      ...raffle,
      id: `mock-${mockIdCounter++}`,
      created_at: new Date().toISOString(),
      tickets_sold: 0,
      drawn_at: null,
      winning_ticket_number: null,
    };
    mockRaffles.push(newRaffle);
    return newRaffle;
  }
  const { data, error } = await supabase
    .from('raffles')
    .insert({
      ...raffle,
      tickets_sold: 0,
      status: 'active'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function closeRaffle(id: string): Promise<void> {
  if (!isConfigured) {
    const raffle = mockRaffles.find(r => r.id === id);
    if (raffle) raffle.status = 'closed';
    return;
  }
  const { error } = await supabase
    .from('raffles')
    .update({ status: 'closed' })
    .eq('id', id);
  
  if (error) throw error;
}

export async function drawWinner(id: string, winningNumber: number): Promise<void> {
  if (!isConfigured) {
    const raffle = mockRaffles.find(r => r.id === id);
    if (raffle) {
      raffle.status = 'drawn';
      raffle.winning_ticket_number = winningNumber;
      raffle.drawn_at = new Date().toISOString();
    }
    return;
  }
  const { error } = await supabase
    .from('raffles')
    .update({ 
      status: 'drawn',
      winning_ticket_number: winningNumber,
      drawn_at: new Date().toISOString()
    })
    .eq('id', id);
  
  if (error) throw error;
}

export async function deleteRaffle(id: string): Promise<void> {
  if (!isConfigured) {
    mockRaffles = mockRaffles.filter(r => r.id !== id);
    mockTickets = mockTickets.filter(t => t.raffle_id !== id);
    return;
  }
  const { error } = await supabase
    .from('raffles')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Ticket operations
export async function getTicketsByRaffleId(raffleId: string): Promise<Ticket[]> {
  if (!isConfigured) {
    return mockTickets.filter(t => t.raffle_id === raffleId);
  }
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('raffle_id', raffleId)
    .order('ticket_number', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function getAvailableTicketNumbers(raffleId: string, totalTickets: number): Promise<number[]> {
  const tickets = await getTicketsByRaffleId(raffleId);
  const soldNumbers = new Set(tickets.map(t => t.ticket_number));
  
  const available: number[] = [];
  for (let i = 1; i <= totalTickets; i++) {
    if (!soldNumbers.has(i)) {
      available.push(i);
    }
  }
  
  return available;
}

export async function purchaseTickets(
  raffleId: string,
  buyerName: string,
  buyerEmail: string,
  buyerPhone: string | null,
  quantity: number
): Promise<Ticket[]> {
  const raffle = await getRaffleById(raffleId);
  if (!raffle) throw new Error('Raffle not found');
  
  const available = await getAvailableTicketNumbers(raffleId, raffle.total_tickets);
  if (available.length < quantity) {
    throw new Error(`Only ${available.length} tickets available`);
  }
  
  // Randomly select ticket numbers
  const selectedNumbers: number[] = [];
  const availableCopy = [...available];
  
  for (let i = 0; i < quantity; i++) {
    const randomIndex = Math.floor(Math.random() * availableCopy.length);
    selectedNumbers.push(availableCopy.splice(randomIndex, 1)[0]);
  }
  
  if (!isConfigured) {
    const newTickets: Ticket[] = selectedNumbers.map(num => ({
      id: `mock-ticket-${mockIdCounter++}`,
      raffle_id: raffleId,
      ticket_number: num,
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      buyer_phone: buyerPhone,
      purchased_at: new Date().toISOString(),
    }));
    mockTickets.push(...newTickets);
    // Update tickets_sold
    const r = mockRaffles.find(rf => rf.id === raffleId);
    if (r) r.tickets_sold += quantity;
    return newTickets;
  }
  
  // Create tickets
  const ticketsToInsert = selectedNumbers.map(num => ({
    raffle_id: raffleId,
    ticket_number: num,
    buyer_name: buyerName,
    buyer_email: buyerEmail,
    buyer_phone: buyerPhone
  }));
  
  const { data, error } = await supabase
    .from('tickets')
    .insert(ticketsToInsert)
    .select();
  
  if (error) throw error;
  
  // Update tickets_sold count
  await supabase
    .from('raffles')
    .update({ tickets_sold: raffle.tickets_sold + quantity })
    .eq('id', raffleId);
  
  return data || [];
}
