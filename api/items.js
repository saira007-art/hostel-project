const { Pool } = require('pg');

let pool;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
}

const mockItems = [
  { id: '1', title: 'Engineering Physics Book', description: 'Available for lending for 1 week', item_type: 'borrow', status: 'available' },
  { id: '2', title: 'Table Fan', description: 'Used table fan for Rs 500', item_type: 'sell', status: 'available' }
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (!pool) {
      if (req.method === 'GET') {
        return res.status(200).json({ success: true, data: mockItems });
      } else if (req.method === 'POST') {
        const { title, description, item_type } = req.body;
        const n = { id: Date.now().toString(), title, description, item_type, status: 'available', created_at: new Date().toISOString() };
        mockItems.unshift(n);
        return res.status(201).json({ success: true, data: n });
      }
    }

    if (req.method === 'GET') {
      const result = await pool.query("SELECT * FROM items WHERE status = 'available' ORDER BY created_at DESC LIMIT 10");
      return res.status(200).json({ success: true, data: result.rows });
    } else if (req.method === 'POST') {
      const { user_id, title, description, item_type, contact_info } = req.body;
      const result = await pool.query(
        'INSERT INTO items (user_id, title, description, item_type, contact_info) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [user_id || 'guest', title, description, item_type, contact_info || '']
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
