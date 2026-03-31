const { Pool } = require('pg');

let pool;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
}

const mockLaundry = [
  { id: '1', user_id: '123', machine_number: 2, slot_time: new Date(Date.now() + 3600000).toISOString(), status: 'booked', created_at: new Date().toISOString() }
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (!pool) {
      if (req.method === 'GET') {
        return res.status(200).json({ success: true, data: mockLaundry });
      } else if (req.method === 'POST') {
        const { machine_number, slot_time } = req.body;
        const n = { id: Date.now().toString(), machine_number, slot_time, status: 'booked', created_at: new Date().toISOString() };
        mockLaundry.push(n);
        return res.status(201).json({ success: true, data: n });
      }
    }

    if (req.method === 'GET') {
      const result = await pool.query('SELECT * FROM laundry_bookings ORDER BY slot_time DESC LIMIT 10');
      return res.status(200).json({ success: true, data: result.rows });
    } else if (req.method === 'POST') {
      const { user_id, machine_number, slot_time } = req.body;
      const result = await pool.query(
        'INSERT INTO laundry_bookings (user_id, machine_number, slot_time) VALUES ($1, $2, $3) RETURNING *',
        [user_id || 'guest', machine_number || 1, slot_time || new Date().toISOString()]
      );
      return res.status(201).json({ success: true, data: result.rows[0] });
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
