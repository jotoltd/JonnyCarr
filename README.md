# Jonny Carr Cue

A modern raffle ticket system built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Buy Raffle Tickets**: Users can browse active raffles and purchase tickets
- **Admin Panel**: Create, manage, and draw winners for raffles
- **Real-time Updates**: Ticket sales and availability update in real-time
- **Secure**: Built with Supabase for secure data storage
- **Responsive**: Works on desktop and mobile devices

## Tech Stack

- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Supabase for backend (PostgreSQL database)
- Lucide React for icons

## Getting Started

### 1. Clone and Install

```bash
cd jonny-carr-cue-raffle
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once your project is created, go to Project Settings > API
3. Copy your `Project URL` and `anon/public` key
4. Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Create Database Tables

In your Supabase project, go to the SQL Editor and run the following SQL:

```sql
-- Create raffles table
CREATE TABLE raffles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    total_tickets INTEGER NOT NULL CHECK (total_tickets > 0),
    price_per_ticket DECIMAL(10,2) NOT NULL CHECK (price_per_ticket > 0),
    tickets_sold INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'drawn')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    drawn_at TIMESTAMP WITH TIME ZONE,
    winning_ticket_number INTEGER
);

-- Create tickets table
CREATE TABLE tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    raffle_id UUID REFERENCES raffles(id) ON DELETE CASCADE,
    ticket_number INTEGER NOT NULL,
    buyer_name TEXT NOT NULL,
    buyer_email TEXT NOT NULL,
    buyer_phone TEXT,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_tickets_raffle_id ON tickets(raffle_id);
CREATE INDEX idx_tickets_ticket_number ON tickets(raffle_id, ticket_number);

-- Enable Row Level Security (RLS)
ALTER TABLE raffles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Allow all access for now (in production, use proper auth)
CREATE POLICY "Allow all operations on raffles"
    ON raffles FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations on tickets"
    ON tickets FOR ALL
    USING (true)
    WITH CHECK (true);
```

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage

### For Users
1. Browse active raffles on the home page
2. Click "Buy Tickets" on any raffle
3. Enter your name, email, and phone number
4. Select the number of tickets to purchase
5. Complete the purchase to receive your ticket numbers

### For Admins
1. Click the "Admin" tab in the navigation
2. Login with the password: `admin123`
3. Create new raffles with the "Create New Raffle" button
4. Manage existing raffles:
   - View all sold tickets
   - Close raffles to stop ticket sales
   - Draw winners (randomly selects from sold tickets)
   - Delete raffles

## Admin Password

The default admin password is: `admin123`

**Note**: In a production environment, you should implement proper authentication with Supabase Auth.

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

This app can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- Supabase Hosting

Make sure to set the environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) in your hosting platform.
