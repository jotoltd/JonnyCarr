import { createClient } from '@supabase/supabase-js';
import type { Raffle, Ticket, User } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// User operations
export async function registerUser(email: string, password: string, name: string): Promise<User> {
  const { data: existing } = await supabase
    .from('users')
    .select('email')
    .eq('email', email)
    .single();
  
  if (existing) {
    throw new Error('User already exists with this email');
  }
  
  const { data, error } = await supabase
    .from('users')
    .insert({ email, password, name })
    .select('id, email, name, created_at')
    .single();
  
  if (error) throw error;
  return data;
}

export async function loginUser(email: string, password: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, created_at, password')
    .eq('email', email)
    .eq('password', password)
    .single();
  
  if (error || !data) {
    throw new Error('Invalid email or password');
  }
  
  // Don't return password to client
  const { password: _, ...user } = data;
  return user;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, created_at')
    .eq('email', email)
    .single();
  
  if (error) return null;
  return data;
}

// PayPal Settings operations
export interface PayPalSettings {
  id?: string;
  client_id: string;
  business_email: string;
  mode: 'sandbox' | 'live';
  enabled: boolean;
  updated_at?: string;
}

export async function getPayPalSettingsDB(): Promise<PayPalSettings | null> {
  const { data, error } = await supabase
    .from('paypal_settings')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error) return null;
  return data;
}

export async function savePayPalSettingsDB(settings: Omit<PayPalSettings, 'id' | 'updated_at'>): Promise<void> {
  const { error } = await supabase
    .from('paypal_settings')
    .upsert({
      ...settings,
      updated_at: new Date().toISOString()
    });
  
  if (error) throw error;
}

// Raffle operations
export async function getActiveRaffles(): Promise<Raffle[]> {
  const { data, error } = await supabase
    .from('raffles')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getAllRaffles(): Promise<Raffle[]> {
  const { data, error } = await supabase
    .from('raffles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getRaffleById(id: string): Promise<Raffle | null> {
  const { data, error } = await supabase
    .from('raffles')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createRaffle(raffle: Omit<Raffle, 'id' | 'created_at' | 'tickets_sold' | 'drawn_at' | 'winning_ticket_number'>): Promise<Raffle> {
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
  const { error } = await supabase
    .from('raffles')
    .update({ status: 'closed' })
    .eq('id', id);
  
  if (error) throw error;
}

export async function drawWinner(id: string, winningNumber: number): Promise<void> {
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
  const { error } = await supabase
    .from('raffles')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Ticket operations
export async function getTicketsByRaffleId(raffleId: string): Promise<Ticket[]> {
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
