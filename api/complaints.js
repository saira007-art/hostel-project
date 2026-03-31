const { Pool } = require('pg');

let pool;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
}

const mockComplaints = [
  { id: '1', category: 'water', description: 'No hot water in bathroom C', status: 'pending', created_at: new Date().toISOString() },
  { id: '2', category: 'wifi', description: 'Router on 2nd floor is down', status: 'in-progress', created_at: new Date(Date.now() - 3600000).toISOString() }
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (!pool) {
      if (req.method === 'GET') {
        return res.status(200).json({ success: true, data: mockComplaints });
      } else if (req.method === 'POST') {
        const { category, description, room_number } = req.body;
        if (!category || !description) return res.status(400).json({ success: false, message: 'Category and description required' });
        const newC = { id: Date.now().toString(), category, description, room_number: room_number || 'Unknown', status: 'pending', created_at: new Date().toISOString() };
        mockComplaints.unshift(newC);
        return res.status(201).json({ success: true, data: newC });
      }
    }

    if (req.method === 'GET') {
      const statusParam = req.query.status;
      let query = 'SELECT * FROM complaints ORDER BY created_at DESC';
      let values = [];

      if (statusParam) {
        query = 'SELECT * FROM complaints WHERE status = $1 ORDER BY created_at DESC';
        values = [statusParam];
      }

      const result = await pool.query(query, values);
      return res.status(200).json({ success: true, data: result.rows });
      
    } else if (req.method === 'POST') {
      const { category, description, room_number } = req.body;
      if (!category || !description) {
        return res.status(400).json({ success: false, message: 'Category and description are required' });
      }
      const insertQuery = `
        INSERT INTO complaints (category, description, room_number) 
        VALUES ($1, $2, $3) 
        RETURNING *`;
      const values = [category, description, room_number || 'Unknown'];
      const result = await pool.query(insertQuery, values);
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
