import { Client } from 'pg';

const connectionString = 'postgresql://postgres:R1l3yj014!sdwv4v1414!@db.zpwxyctbguhhfunkkmkw.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function createPolicies() {
  try {
    await client.connect();
    console.log('Connected to Supabase database');

    // Drop existing policies if they exist, then create new ones
    await client.query(`
      DROP POLICY IF EXISTS "Allow all" ON raffles;
      CREATE POLICY "Allow all" ON raffles FOR ALL USING (true) WITH CHECK (true)
    `);
    console.log('✓ raffles policy created');

    await client.query(`
      DROP POLICY IF EXISTS "Allow all" ON tickets;
      CREATE POLICY "Allow all" ON tickets FOR ALL USING (true) WITH CHECK (true)
    `);
    console.log('✓ tickets policy created');

    console.log('\n✅ All policies created successfully!');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createPolicies();
