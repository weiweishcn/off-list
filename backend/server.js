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
const designData = require('./DesignData');
console.log('Loaded design data:', designData);
const zlib = require('zlib');

const app = express();
const port = process.env.PORT || 3001;

app.use((req, res, next) => {
  console.log('Incoming request:', {
    path: req.path,
    acceptEncoding: req.headers['accept-encoding']
  });
  next();
});

app.use(cors({
  origin: ['http://localhost:3000', 'http://165.232.131.137:3000', 'https://pencildogs.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


// Configure compression with debug logging
const customCompression = (req, res, next) => {
  const _send = res.send;
  res.send = function (body) {
    if (req.headers['accept-encoding']?.includes('gzip')) {
      // Only compress JSON responses
      if (typeof body === 'string' || Buffer.isBuffer(body)) {
        zlib.gzip(body, (err, compressed) => {
          if (err) {
            console.error('Compression error:', err);
            return _send.call(this, body);
          }

          res.setHeader('Content-Encoding', 'gzip');
          res.setHeader('Vary', 'Accept-Encoding');
          
          // Log compression stats
          const originalSize = Buffer.byteLength(body);
          const compressedSize = Buffer.byteLength(compressed);
          console.log('Compression stats:', {
            originalSize,
            compressedSize,
            ratio: ((originalSize - compressedSize) / originalSize * 100).toFixed(2) + '%'
          });

          _send.call(this, compressed);
        });
        return;
      }
    }
    _send.call(this, body);
  };
  next();
};

app.use(customCompression);

// More detailed response logging
app.use((req, res, next) => {
  const originalSend = res.send;
  const originalJson = res.json;

  res.send = function(...args) {
    console.log('Response send headers:', {
      path: req.path,
      contentEncoding: res.getHeader('content-encoding'),
      contentLength: res.getHeader('content-length'),
      contentType: res.getHeader('content-type'),
      vary: res.getHeader('vary')
    });
    return originalSend.apply(res, args);
  };

  res.json = function(...args) {
    console.log('Response json headers:', {
      path: req.path,
      contentEncoding: res.getHeader('content-encoding'),
      contentLength: res.getHeader('content-length'),
      contentType: res.getHeader('content-type'),
      vary: res.getHeader('vary')
    });
    return originalJson.apply(res, args);
  };

  next();
});

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

// Test DB connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// Set S3 endpoint to DigitalOcean Spaces
const spacesEndpoint = new aws.Endpoint('sfo3.digitaloceanspaces.com');
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
  accessKeyId: env.SPACES_KEY,
  secretAccessKey: env.SPACES_SECRET
});

const listS3FolderContents = async (folderPrefix) => {
  const params = {
    Bucket: 'designimages',
    Prefix: folderPrefix
  };

  try {
    const data = await s3.listObjects(params).promise();
    // Sort the contents to ensure consistent order
    const sortedContents = data.Contents
      .filter(object => object.Key.match(/\.(jpg|jpeg|png|gif)$/i))
      .sort((a, b) => {
        // Extract numbers from filenames for natural sorting
        const numA = parseInt(a.Key.match(/\d+/g).pop());
        const numB = parseInt(b.Key.match(/\d+/g).pop());
        return numA - numB;
      });

    return sortedContents.map(object => {
      // Make sure we don't double-include the folder name
      const key = object.Key.startsWith(folderPrefix) 
        ? object.Key 
        : `${folderPrefix}${object.Key}`;
      return `https://designimages.sfo3.digitaloceanspaces.com/${key}`;
    });
  } catch (error) {
    console.error('Error listing S3 objects:', error);
    return [];
  }
};

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
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Floor plan must be PDF, JPG, or PNG'));
    }
  }
}).array('uploadFiles', 10);

// Modified /api/design endpoint with explicit compression handling
app.get('/api/design', async function (req, res) {
  try {
    const designData = require('./DesignData');
    
    const designsWithImages = await Promise.all(
      designData.designs.map(async (design) => {
        if (!design.folder) {
          return design;
        }
        
        const s3Images = await listS3FolderContents(design.folder);
        return {
          ...design,
          images: s3Images.length > 0 ? s3Images : design.images
        };
      })
    );

    // Set headers explicitly
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    
    // Log response size before compression
    const responseData = { designs: designsWithImages };
    const responseSize = Buffer.byteLength(JSON.stringify(responseData));
    console.log('Response size before compression:', responseSize, 'bytes');

    // Send response
    res.json(responseData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Failed to get design data',
      details: error.message 
    });
  }
});


app.get('/api/designer', function (req, res) {
  fs.readFile("Data/designerData.json", 'utf8', function (err, data) {
    res.end(data);
  });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', { username, passwordLength: password?.length });
  
  try {
    console.log('Executing query...');
    const result = await pool.query('SELECT password_hash FROM users WHERE email = $1', [username]);
    console.log('Query result:', result.rows);
    
    if (result.rows.length > 0 && result.rows[0].password_hash === password) {
      const token = jwt.sign({ username }, 'secret-key');
      console.log('Login successful, sending token');
      res.status(200).json({ token });
    } else {
      console.log('Invalid credentials - no match found');
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      error: 'Server error', 
      details: err.message 
    });
  }
});

app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);
  try {
    const result = await pool.query('INSERT INTO users (email, password_hash) VALUES ($1, $2)', [username, password]);
    console.log('success');
    const token = jwt.sign({ username: username }, 'secret-key');
    res.send({ token });
    console.log(token);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/properties', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM properties');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected route
app.get('/dashboard', (req, res) => {
  console.log("protected dashboard");
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

// Upload endpoints
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

// Serve static files for React app
app.use(express.static(path.join(__dirname, '../frontend/off-list/build')));

// Handle React routing
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, '../frontend/off-list/build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});