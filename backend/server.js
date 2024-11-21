// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require("fs");
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const multiparty = require('multiparty');
const jwt = require('jsonwebtoken');
const { env } = require('process');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());

app.use(cors({
  origin: ['http://165.232.131.137:3000', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Database connection
console.log(env.DB_DATABASE);
const pool = new Pool({
  user: env.DB_USER,
  host: env.DB_HOST,
  database: env.DB_DATABASE,
  password: env.DB_PASSWORD,
  port: 25060,
  ssl: {
    ca: fs.readFileSync("DB/ca-certificate.crt").toString()
  }
});

// Add this to server.js to test DB connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const result = await pool.query('SELECT password_hash FROM users WHERE email = $1', [username]);
    
    if (result.rows.length > 0 && result.rows[0].password_hash === password) {
      const token = jwt.sign({ username }, 'secret-key');
      res.status(200).json({ token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

    app.post('/api/signup', async (req, res) => {
     const { username, password } = req.body;
     console.log(username, password)
    try {
      const result = await pool.query('INSERT INTO users (email, password_hash) VALUES ($1, $2)', [username, password]);
      console.log('success');
      const token = jwt.sign({ username: username }, 'secret-key');
      res.send({ token });
      console.log(token);
        //res.redirect('http://localhost:3000/dashboard'); 
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ error: err.message });
    }
   });

   // Protected route
  app.get('/dashboard', (req, res) => {
    console.log("protected dashboard")
    const token = req.headers['authorization'];
    if (token) {
      jwt.verify(token, 'secret-key', (err, decoded) => {
        if (err) {
          res.send('Invalid token');
        } else {
          res.send(`Welcome, ${decoded.username}!`);
        }
      });
    } else {
      res.send('Unauthorized');
    }
  });

// File upload configuration

// Set S3 endpoint to DigitalOcean Spaces
//https://designimages.sfo3.digitaloceanspaces.com
const spacesEndpoint = new aws.Endpoint('sfo3.digitaloceanspaces.com');
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
  accessKeyId: env.SPACES_KEY,
  secretAccessKey: env.SPACES_SECRET
});

// Regular image upload configuration
const imageUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'designimages',
    acl: 'public-read',
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const originalName = file.originalname || '';
      const fileExtension = originalName.split('.').pop() || '';
      cb(null, `${file.fieldname}-${uniqueSuffix}${fileExtension ? '.' + fileExtension : ''}`);
    }
  }),
  limits: {
    fileSize: 100 * 1024 * 1024,
    files: 10
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/jpg'
    ) {
      cb(null, true);
    } else {
      const err = new Error('Images must be JPG or PNG');
      err.name = 'ExtensionError';
      return cb(err);
    }
  }
}).array('uploadFiles', 10);

// Floor plan upload configuration
const floorPlanUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'designimages',
    acl: 'public-read',
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const originalName = file.originalname || '';
      const fileExtension = originalName.split('.').pop() || '';
      cb(null, `floor-plan-${uniqueSuffix}${fileExtension ? '.' + fileExtension : ''}`);
    }
  }),
  limits: {
    fileSize: 100 * 1024 * 1024,
    files: 10
  },
  fileFilter: (req, file, cb) => {
    // Check MIME type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Floor plan must be PDF, JPG, or PNG'));
    }
  }
}).array('uploadFiles', 10);

// Regular image upload endpoint
app.post('/api/upload', (req, res) => {
  imageUpload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(500).send({
        error: { msg: `Upload error: ${err.message}` }
      });
    } else if (err) {
      console.error('Upload error:', err);
      if (err.name === 'ExtensionError') {
        return res.status(413).send({ error: { msg: err.message } });
      }
      return res.status(500).send({ 
        error: { msg: `Upload error: ${err.message}` } 
      });
    }

    if (req.files && req.files.length > 0) {
      const imageUrls = req.files.map(file => file.location);
      console.log("Uploaded image URLs:", imageUrls);
      res.status(200).json({ imageUrls });
    } else {
      res.status(400).send({ error: { msg: 'No files uploaded' } });
    }
  });
});

// Floor plan upload endpoint
app.post('/api/upload-floor-plan', (req, res) => {
  floorPlanUpload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(500).send({
        error: { msg: `Upload error: ${err.message}` }
      });
    } else if (err) {
      console.error('Upload error:', err);
      if (err.name === 'ExtensionError') {
        return res.status(413).send({ error: { msg: err.message } });
      }
      return res.status(500).send({ 
        error: { msg: `Upload error: ${err.message}` } 
      });
    }

    if (req.files && req.files.length > 0) {
      const urls = req.files.map(file => file.location);
      console.log("Uploaded floor plan URLs:", urls);
      res.status(200).json({ imageUrls: urls });
    } else {
      res.status(400).send({ error: { msg: 'No files uploaded' } });
    }
  });
});
/*
old upload api 
app.post('/api/upload', (req, res) => {
  console.log("received upload request");
    multi_upload(req, res, function (err) {
    console.log(req.files);
    //multer error
    if (err instanceof multer.MulterError) {
      console.log(err);
      res
        .status(500)
        .send({
          error: { msg: `multer uploading error: ${err.message}` },
        })
        .end();
      return;
    } else if (err) {
      //unknown error
      if (err.name == 'ExtensionError') {
        console.log("upload extension error", err.message);
        res
          .status(413)
          .send({ error: { msg: `${err.message}` } })
          .end();
      } else {
        console.log("upload 500 error")
        res
          .status(500)
          .send({ error: { msg: `unknown uploading error: ${err.message}` } })
          .end();
      }
      return;
    }
    console.log("upload success");
    res.status(200).send('file uploaded');
  });
});
*/

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

/*
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
*/

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});