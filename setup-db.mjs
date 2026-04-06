import { Client } from 'pg';

const connectionString = 'postgresql://postgres:R1l3yj014!sdwv4v1414!@db.zpwxyctbguhhfunkkmkw.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function createTables() {
  try {
    await client.connect();
    console.log('Connected to Supabase database');

    // Create raffles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS raffles (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        total_tickets INTEGER NOT NULL,
        price_per_ticket DECIMAL(10,2) NOT NULL,
        tickets_sold INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        drawn_at TIMESTAMP WITH TIME ZONE,
        winning_ticket_number INTEGER
      )
    `);
    console.log('✓ raffles table created');

    // Create tickets table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        raffle_id UUID REFERENCES raffles(id) ON DELETE CASCADE,
        ticket_number INTEGER NOT NULL,
        buyer_name TEXT NOT NULL,
        buyer_email TEXT NOT NULL,
        buyer_phone TEXT,
        purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✓ tickets table created');

    // Enable RLS
    await client.query('ALTER TABLE raffles ENABLE ROW LEVEL SECURITY');
    await client.query('ALTER TABLE tickets ENABLE ROW LEVEL SECURITY');
    console.log('✓ Row Level Security enabled');

    // Create policies
    await client.query(`
      CREATE POLICY IF NOT EXISTS "Allow all" ON raffles FOR ALL USING (true) WITH CHECK (true)
    `);
    await client.query(`
      CREATE POLICY IF NOT EXISTS "Allow all" ON tickets FOR ALL USING (true) WITH CHECK (true)
    `);
    console.log('✓ Policies created');

    console.log('\n✅ All tables and policies created successfully!');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createTables();
