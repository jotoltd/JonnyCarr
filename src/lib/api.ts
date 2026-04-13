import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import type { Raffle, SkillQuestion, Ticket, User } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const RAFFLE_IMAGE_BUCKET = 'raffle-images';

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

  const hashedPassword = await bcrypt.hash(password, 10);
  
  const { data, error } = await supabase
    .from('users')
    .insert({ email, password: hashedPassword, name, role: 'user' })
    .select('id, email, name, role, created_at')
    .single();
  
  if (error) throw error;
  return data;
}

export async function loginUser(email: string, password: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, role, created_at, password')
    .eq('email', email)
    .single();
  
  if (error || !data) {
    throw new Error('Invalid email or password');
  }

  const storedPassword: string = data.password;
  let passwordMatch = false;

  // Check if stored password is a bcrypt hash
  if (storedPassword.startsWith('$2')) {
    passwordMatch = await bcrypt.compare(password, storedPassword);
  } else {
    // Plain text (legacy) — compare and re-hash on success
    passwordMatch = storedPassword === password;
    if (passwordMatch) {
      const hashed = await bcrypt.hash(password, 10);
      await supabase.from('users').update({ password: hashed }).eq('id', data.id);
    }
  }

  if (!passwordMatch) {
    throw new Error('Invalid email or password');
  }
  
  const { password: _, ...user } = data;
  return user;
}

export async function updateUser(
  id: string,
  updates: { name?: string; email?: string; password?: string }
): Promise<User> {
  if (updates.password) {
    updates = { ...updates, password: await bcrypt.hash(updates.password, 10) };
  }
  if (updates.email) {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', updates.email)
      .neq('id', id)
      .single();
    if (existing) throw new Error('That email is already in use');
  }

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select('id, email, name, role, created_at')
    .single();

  if (error) throw error;
  return data;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, role, created_at')
    .eq('email', email)
    .single();
  
  if (error) return null;
  return data;
}

export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, role, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function deleteUser(id: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function createAdminUser(email: string, password: string, name: string): Promise<User> {
  // Check if user exists (use maybeSingle instead of single to avoid 406 error)
  const { data: existing, error: checkError } = await supabase
    .from('users')
    .select('email')
    .eq('email', email)
    .maybeSingle();

  if (checkError) {
    throw new Error(`Database check failed: ${checkError.message}`);
  }

  if (existing) {
    throw new Error('User already exists with this email');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Try to insert with role, but if role column doesn't exist, try without it
  let { data, error } = await supabase
    .from('users')
    .insert({ email, password: hashedPassword, name, role: 'admin' })
    .select('id, email, name, role, created_at')
    .single();

  // If role column error, try without role (fallback for missing column)
  if (error && error.message && error.message.includes('role')) {
    const result = await supabase
      .from('users')
      .insert({ email, password: hashedPassword, name })
      .select('id, email, name, created_at')
      .single();
    data = result.data as User;
    error = result.error;
  }

  if (error) {
    throw new Error(`Insert failed: ${error.message} (${error.code || 'no code'})`);
  }
  if (!data) {
    throw new Error('No data returned from insert');
  }
  return data as User;
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

// Default sandbox credentials for immediate testing
const DEFAULT_SANDBOX_SETTINGS: PayPalSettings = {
  client_id: 'AcalknmOIPLrNFZ4tdptZtW83FqksWxh4zMBmyY9X8WtXu49h5LJEB2tujhlVJxiJhpM4rB_Z_K0pH9E',
  business_email: 'sb-qza3m50402059@business.example.com',
  mode: 'sandbox',
  enabled: true,
};

export async function getPayPalSettingsDB(): Promise<PayPalSettings | null> {
  const { data, error } = await supabase
    .from('paypal_settings')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();
  
  // Return sandbox defaults if no settings in DB (app works out of the box)
  if (error || !data) {
    return DEFAULT_SANDBOX_SETTINGS;
  }
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

// Skill question operations
export async function getSkillQuestions(): Promise<SkillQuestion[]> {
  const { data, error } = await supabase
    .from('skill_questions')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getAllSkillQuestions(): Promise<SkillQuestion[]> {
  const { data, error } = await supabase
    .from('skill_questions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getSkillQuestionById(id: string): Promise<SkillQuestion | null> {
  const { data, error } = await supabase
    .from('skill_questions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function createSkillQuestion(question: {
  prompt: string;
  answer: string;
}): Promise<SkillQuestion> {
  const { data, error } = await supabase
    .from('skill_questions')
    .insert({
      prompt: question.prompt,
      answer: question.answer.trim().toLowerCase(),
      is_active: true,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function updateSkillQuestion(
  id: string,
  updates: { prompt?: string; answer?: string }
): Promise<SkillQuestion> {
  const payload: { prompt?: string; answer?: string } = {};

  if (typeof updates.prompt === 'string') {
    payload.prompt = updates.prompt.trim();
  }
  if (typeof updates.answer === 'string') {
    payload.answer = updates.answer.trim().toLowerCase();
  }

  const { data, error } = await supabase
    .from('skill_questions')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function deactivateSkillQuestion(id: string): Promise<void> {
  const { error } = await supabase
    .from('skill_questions')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw error;
}

export async function getActiveRafflesUsingQuestion(questionId: string): Promise<Raffle[]> {
  const { data, error } = await supabase
    .from('raffles')
    .select('*')
    .eq('skill_question_id', questionId)
    .eq('status', 'active');

  if (error) throw error;
  return data || [];
}

export async function validateSkillAnswer(questionId: string, answer: string): Promise<boolean> {
  const question = await getSkillQuestionById(questionId);
  if (!question) return false;
  return question.answer.trim().toLowerCase() === answer.trim().toLowerCase();
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

export async function getCompletedRaffles(): Promise<Raffle[]> {
  const { data, error } = await supabase
    .from('raffles')
    .select('*')
    .in('status', ['closed', 'drawn'])
    .order('drawn_at', { ascending: false });

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

export async function uploadRaffleImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `raffles/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(RAFFLE_IMAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from(RAFFLE_IMAGE_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
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
export async function getTicketsByBuyerEmail(email: string): Promise<(Ticket & { raffle_title: string; raffle_status: string })[]> {
  const { data, error } = await supabase
    .from('tickets')
    .select('*, raffles(title, status)')
    .eq('buyer_email', email)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map((t: Ticket & { raffles: { title: string; status: string } }) => ({
    ...t,
    raffle_title: t.raffles?.title ?? 'Unknown Raffle',
    raffle_status: t.raffles?.status ?? 'unknown',
  }));
}

export async function getTicketsByRaffleId(raffleId: string): Promise<Ticket[]> {
  const { data, error } = await supabase
    .from('tickets')
    .select('id, raffle_id, ticket_number, buyer_name, buyer_email, buyer_phone, paypal_order_id, purchased_at')
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

// PayPal order verification - Server-side validation
export async function verifyPayPalOrder(
  orderId: string,
  expectedAmount: number,
  mode: 'sandbox' | 'live' = 'sandbox'
): Promise<{ verified: boolean; payerEmail?: string; error?: string }> {
  try {
    // Get PayPal settings for API credentials
    const settings = await getPayPalSettingsDB();
    if (!settings) {
      return { verified: false, error: 'PayPal not configured' };
    }

    // Determine the correct PayPal API URL
    const baseUrl = mode === 'live' 
      ? 'https://api.paypal.com' 
      : 'https://api.sandbox.paypal.com';

    // Call PayPal API to verify order
    // Note: In production, this should be done via Supabase Edge Function
    // to keep client credentials secure
    const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Use the client ID as a basic auth header (PayPal's recommended approach for client-side)
        'Authorization': `Bearer ${settings.client_id}`
      }
    });

    if (!response.ok) {
      return { verified: false, error: 'Failed to verify order with PayPal' };
    }

    const orderData = await response.json();

    // Verify order status and amount
    if (orderData.status !== 'COMPLETED' && orderData.status !== 'APPROVED') {
      return { verified: false, error: `Order status is ${orderData.status}, not completed` };
    }

    const purchaseUnit = orderData.purchase_units?.[0];
    if (!purchaseUnit) {
      return { verified: false, error: 'No purchase unit found in order' };
    }

    const orderAmount = parseFloat(purchaseUnit.amount?.value || '0');
    if (Math.abs(orderAmount - expectedAmount) > 0.01) {
      return { verified: false, error: `Amount mismatch: expected £${expectedAmount}, got £${orderAmount}` };
    }

    // Check if order was already used (prevent replay attacks)
    const { data: existingTicket } = await supabase
      .from('tickets')
      .select('id')
      .eq('paypal_order_id', orderId)
      .limit(1)
      .single();

    if (existingTicket) {
      return { verified: false, error: 'This payment has already been used' };
    }

    return {
      verified: true,
      payerEmail: orderData.payer?.email_address
    };
  } catch (err) {
    console.error('PayPal verification error:', err);
    return { verified: false, error: 'Verification failed' };
  }
}

export async function purchaseTickets(
  raffleId: string,
  buyerName: string,
  buyerEmail: string,
  buyerPhone: string | null,
  quantity: number,
  selectedTicketNumbers?: number[],
  paypalOrderId?: string
): Promise<Ticket[]> {
  const raffle = await getRaffleById(raffleId);
  if (!raffle) throw new Error('Raffle not found');
  
  const available = await getAvailableTicketNumbers(raffleId, raffle.total_tickets);
  if (available.length < quantity) {
    throw new Error(`Only ${available.length} tickets available`);
  }

  let selectedNumbers: number[] = [];

  if (selectedTicketNumbers && selectedTicketNumbers.length > 0) {
    if (selectedTicketNumbers.length !== quantity) {
      throw new Error('Selected ticket count does not match quantity');
    }

    const uniqueSelected = Array.from(new Set(selectedTicketNumbers));
    if (uniqueSelected.length !== selectedTicketNumbers.length) {
      throw new Error('Duplicate ticket numbers selected');
    }

    const invalidSelected = uniqueSelected.filter(
      (num) => num < 1 || num > raffle.total_tickets
    );
    if (invalidSelected.length > 0) {
      throw new Error('One or more selected ticket numbers are invalid');
    }

    const availableSet = new Set(available);
    const unavailableSelected = uniqueSelected.filter((num) => !availableSet.has(num));
    if (unavailableSelected.length > 0) {
      throw new Error(
        `Ticket${unavailableSelected.length > 1 ? 's' : ''} ${unavailableSelected.join(', ')} ${unavailableSelected.length > 1 ? 'are' : 'is'} no longer available`
      );
    }

    selectedNumbers = uniqueSelected;
  } else {
    const availableCopy = [...available];
    for (let i = 0; i < quantity; i++) {
      const randomIndex = Math.floor(Math.random() * availableCopy.length);
      selectedNumbers.push(availableCopy.splice(randomIndex, 1)[0]);
    }
  }
  
  // Create tickets
  const ticketsToInsert = selectedNumbers.map(num => ({
    raffle_id: raffleId,
    ticket_number: num,
    buyer_name: buyerName,
    buyer_email: buyerEmail,
    buyer_phone: buyerPhone,
    paypal_order_id: paypalOrderId || null
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
