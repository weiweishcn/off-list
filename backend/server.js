// server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  user: 'offlist_user',
  host: 'localhost',
  database: 'offlist',
  password: 'your_password',
  port: 5432,
});

// File upload configuration
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Routes
app.get('/api/design', function (req, res) {
   fs.readFile("data/DesignData.json", 'utf8', function (err, data) {
      res.end( data );
   });
})

app.get('/api/designer', function (req, res) {
   fs.readFile("data/DesignerData.json", 'utf8', function (err, data) {
      res.end( data );
   });
})

app.get('/api/properties', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM properties');
    res.json(result.rows);
    res.json(designData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/properties', upload.array('media', 10), async (req, res) => {
  try {
    const { title, price, location, description, type } = req.body;
    const files = req.files;
    
    // Add property to database
    const result = await pool.query(
      'INSERT INTO properties (title, price, location, description, type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, price, location, description, type]
    );
    
    // Handle file uploads here
    // You'll want to store file references in a separate table
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});