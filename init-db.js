require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('Connected to database.');
    
    const schemaSql = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf-8');
    
    await client.query(schemaSql);
    console.log('Schema successfully applied.');
  } catch(e) {
    console.error('Failed applying schema', e);
  } finally {
    await client.end();
  }
}

run();
