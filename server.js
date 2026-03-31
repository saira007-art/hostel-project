require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simple wrapper to call vercel handlers
const runVercelHandler = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch(err) {
    console.error(err);
    if (!res.headersSent) res.status(500).json({ error: 'Internal Server Error' });
  }
};

app.all('/api/complaints', runVercelHandler(require('./api/complaints')));
app.all('/api/notices', runVercelHandler(require('./api/notices')));
app.all('/api/items', runVercelHandler(require('./api/items')));
app.all('/api/laundry', runVercelHandler(require('./api/laundry')));

app.listen(PORT, () => {
  console.log(`Server is running locally at http://localhost:${PORT}`);
});
