const { Pool } = require('pg');

let pool;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
}

const mockNotices = [
  { id: '1', title: 'Water Maintenance', content: 'Water supply maintenance scheduled for tomorrow 10 AM to 2 PM.', created_at: new Date().toISOString() },
  { id: '2', title: 'Mess Menu Updated', content: 'The mess menu has been updated with special dinners for this weekend.', created_at: new Date(Date.now() - 86400000).toISOString() }
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (!pool) {
      if (req.method === 'GET') {
        return res.status(200).json({ success: true, data: mockNotices });
      }
      return res.status(405).end('Method Not Allowed DB Offline');
    }

    if (req.method === 'GET') {
      const result = await pool.query('SELECT * FROM notices ORDER BY created_at DESC LIMIT 10');
      return res.status(200).json({ success: true, data: result.rows });
    } else if (req.method === 'POST') {
      const { title, content } = req.body;
      if (!title || !content) return res.status(400).json({ success: false, message: 'Title and content required.' });
      
      const insertQuery = 'INSERT INTO notices (title, content) VALUES ($1, $2) RETURNING *';
      const result = await pool.query(insertQuery, [title, content]);
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
