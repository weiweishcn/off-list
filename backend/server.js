// server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require("fs");
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const multiparty = require('multiparty');

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

// Set S3 endpoint to DigitalOcean Spaces
//https://designimages.sfo3.digitaloceanspaces.com
const spacesEndpoint = new aws.Endpoint('sfo3.digitaloceanspaces.com');
const s3 = new aws.S3({
  endpoint: spacesEndpoint
});

const multi_upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'designimages',
    acl: 'public-read',
  }),
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == 'image/png' ||
      file.mimetype == 'image/jpeg' ||
      file.mimetype == 'image/jpg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      const err = new Error('Only .jpg .jpeg .png images are supported!');
      err.name = 'ExtensionError';
      return cb(err);
    }
  },
}).array('uploadImages', 10);

app.post('/api/upload', (req, res) => {
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
        res
          .status(413)
          .send({ error: { msg: `${err.message}` } })
          .end();
      } else {
        res
          .status(500)
          .send({ error: { msg: `unknown uploading error: ${err.message}` } })
          .end();
      }
      return;
    }
    res.status(200).send('file uploaded');
  });
});

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