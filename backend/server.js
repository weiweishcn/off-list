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

// Add this after your app initialization
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use((req, res, next) => {
  console.log('Incoming request:', {
    path: req.path,
    acceptEncoding: req.headers['accept-encoding']
  });
  next();
});

app.use(cors({
  origin: ['http://localhost:3000', 'http://165.232.131.137:3000', 'https://pencildogs.com', 'http://139.59.97.222:3000'],
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
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, {
        fieldName: file.fieldname,
        'x-amz-meta-cors': '*'
      });
    },
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const originalName = file.originalname || '';
      const fileExtension = path.extname(originalName).toLowerCase();
      cb(null, `floor-plan-${uniqueSuffix}${fileExtension}`);
    },
    shouldTransform: function(req, file, cb) {
      cb(null, /^image/i.test(file.mimetype))
    },
    transforms: [{
      id: 'original',
      key: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `floor-plan-${uniqueSuffix}.jpg`);
      },
      transform: function(req, file, cb) {
        cb(null, sharp().jpeg({ quality: 90 }));
      }
    }]
  }),
  limits: {
    fileSize: 100 * 1024 * 1024,
    files: 10
  }
}).array('uploadFiles', 10);

// Modified upload endpoint
app.post('/api/upload-floor-plan', (req, res) => {
  floorPlanUpload(req, res, async function (err) {
    if (err) {
      console.error('Upload error:', err);
      return res.status(500).send({
        error: { msg: `Upload error: ${err.message}` }
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).send({ error: { msg: 'No files uploaded' } });
    }

    try {
      // Process uploaded files
      const uploadedFiles = req.files.map(file => ({
        url: file.location,
        contentType: file.contentType || file.mimetype,
        key: file.key
      }));

      // Update content type if needed
      for (const file of uploadedFiles) {
        await s3.copyObject({
          Bucket: 'designimages',
          CopySource: `designimages/${file.key}`,
          Key: file.key,
          ContentType: file.contentType,
          ContentDisposition: 'inline',
          MetadataDirective: 'REPLACE',
          ACL: 'public-read'
        }).promise();
      }

      console.log("Uploaded floor plan URLs:", uploadedFiles.map(f => f.url));
      res.status(200).json({ 
        imageUrls: uploadedFiles.map(f => f.url),
        metadata: uploadedFiles
      });
    } catch (error) {
      console.error('Error processing uploads:', error);
      res.status(500).send({ 
        error: { msg: `Error processing uploads: ${error.message}` }
      });
    }
  });
});

// In your server.js
const taggedFloorPlanUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'designimages',
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `tagged-floor-plan-${uniqueSuffix}.png`);
    },
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    }
  }),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for tagged floor plans
  }
}).array('uploadFiles', 1);

app.post('/api/upload-tagged-floor-plan', (req, res) => {
  taggedFloorPlanUpload(req, res, function(err) {
    if (err) {
      console.error('Upload error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          error: { msg: 'File too large. Maximum size is 100MB' }
        });
      }
      return res.status(500).json({
        error: { msg: `Upload error: ${err.message}` }
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: { msg: 'No files uploaded' }
      });
    }

    const imageUrls = req.files.map(file => file.location);
    res.json({ imageUrls });
  });
});

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
    const result = await pool.query(
      'SELECT password_hash, user_type FROM users WHERE email = $1', 
      [username]
    );
    console.log('Query result:', result.rows);
    
    if (result.rows.length > 0 && result.rows[0].password_hash === password) {
      const token = jwt.sign({ 
        username,
        userType: result.rows[0].user_type 
      }, 'secret-key');
      
      console.log('Login successful, sending token');
      res.status(200).json({ 
        token,
        userType: result.rows[0].user_type
      });
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

//const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/create-subscription', async (req, res) => {
  const { paymentMethodId, planId } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, 'secret-key');
    const user = decoded.username;
    
    // Create or get customer
    const customer = await stripe.customers.create({
      payment_method: paymentMethodId,
      email: user,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: planId }],
      expand: ['latest_invoice.payment_intent'],
    });

    // Store subscription info in your database
    await pool.query(
      'UPDATE users SET stripe_subscription_id = $1, stripe_customer_id = $2 WHERE email = $3',
      [subscription.id, customer.id, user]
    );

    res.json({ subscription });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/subscription-status', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, 'secret-key');
    
    // Get subscription from database
    const result = await pool.query(
      'SELECT stripe_subscription_id FROM users WHERE email = $1',
      [decoded.username]
    );

    if (result.rows[0]?.stripe_subscription_id) {
      const subscription = await stripe.subscriptions.retrieve(
        result.rows[0].stripe_subscription_id
      );
      res.json({ subscription });
    } else {
      res.json({ subscription: null });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get projects assigned to the current designer
app.get('/api/designer-projects', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, 'secret-key');
    const email = decoded.username;

    const result = await pool.query(`
      SELECT 
        p.*,
        u.email as client_email
      FROM projects p
      JOIN users u ON p.user_id = u.id
      WHERE p.designer_id = (SELECT id FROM users WHERE email = $1)
      ORDER BY p.last_modified_at DESC
    `, [email]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching designer projects:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all projects for admin
app.get('/api/admin/projects', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, 'secret-key');
    
    // Verify admin status
    if (decoded.userType !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const result = await pool.query(`
      SELECT 
        p.*,
        u1.email as client_email,
        u2.email as designer_email
      FROM projects p
      LEFT JOIN users u1 ON p.user_id = u1.id
      LEFT JOIN users u2 ON p.designer_id = u2.id
      ORDER BY p.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching admin projects:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all designers
app.get('/api/admin/designers', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, 'secret-key');
    if (decoded.userType !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const result = await pool.query(`
      SELECT id, email 
      FROM users 
      WHERE user_type = 'designer'
      ORDER BY email ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching designers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Assign designer to project
app.post('/api/admin/projects/:projectId/assign', async (req, res) => {
  const { projectId } = req.params;
  const { designerId } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, 'secret-key');
    if (decoded.userType !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const result = await pool.query(`
      UPDATE projects 
      SET designer_id = $1, 
          last_modified_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *
    `, [designerId, projectId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error assigning designer:', error);
    res.status(500).json({ error: error.message });
  }
});// Get all designers
app.get('/api/admin/designers', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, 'secret-key');
    if (decoded.userType !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const result = await pool.query(`
      SELECT id, email 
      FROM users 
      WHERE user_type = 'designer'
      ORDER BY email ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching designers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Assign designer to project
app.post('/api/admin/projects/:projectId/assign', async (req, res) => {
  const { projectId } = req.params;
  const { designerId } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, 'secret-key');
    if (decoded.userType !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const result = await pool.query(`
      UPDATE projects 
      SET designer_id = $1, 
          last_modified_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *
    `, [designerId, projectId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error assigning designer:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/projects', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No authorization token provided' });
  }

  let client;
  try {
    const decoded = jwt.verify(token, 'secret-key');
    
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [decoded.username]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userResult.rows[0].id;
    const { rooms, hasFloorPlan, originalFloorPlanUrl, taggedFloorPlanUrl } = req.body;

    // Start transaction
    client = await pool.connect();
    await client.query('BEGIN');

    // 1. Create project record
    const projectResult = await client.query(
      `INSERT INTO projects 
       (user_id, status, has_floor_plan, completed, created_at, last_modified_at, name) 
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $5) 
       RETURNING id`,
      [userId, 'pending', hasFloorPlan, false, `Project ${new Date().toLocaleDateString()}`]
    );

    const projectId = projectResult.rows[0].id;
    const projectFolder = `projects/project-${projectId}`;

    // Function to copy file to project folder
const copyFileToProjectFolder = async (sourceUrl) => {
  if (!sourceUrl) return null;

  try {
    // Extract the key from the full URL
    const urlParts = sourceUrl.split('digitaloceanspaces.com/');
    const sourceKey = urlParts[1]; // This gets everything after digitaloceanspaces.com/

    // Create new key in projects folder
    const filename = sourceKey.split('/').pop(); // Get just the filename
    const newKey = `projects/project-${projectId}/${filename}`;

    console.log('Copying file:', {
      sourceKey,
      newKey,
      sourceUrl
    });

    await s3.copyObject({
      Bucket: 'designimages',
      CopySource: `designimages/${sourceKey}`,
      Key: newKey,
      ACL: 'public-read'
    }).promise();

    // Delete original file after successful copy
    await s3.deleteObject({
      Bucket: 'designimages',
      Key: sourceKey
    }).promise();

    return `https://designimages.sfo3.digitaloceanspaces.com/${newKey}`;
  } catch (error) {
    console.error('Error copying file:', error, { sourceUrl });
    throw error;
  }
};

    // 2. Move and store floor plan data
    let updatedOriginalFloorPlanUrl = null;
    let updatedTaggedFloorPlanUrl = null;

    if (hasFloorPlan && originalFloorPlanUrl) {
      updatedOriginalFloorPlanUrl = await copyFileToProjectFolder(originalFloorPlanUrl);
      if (taggedFloorPlanUrl) {
        updatedTaggedFloorPlanUrl = await copyFileToProjectFolder(taggedFloorPlanUrl);
      }

      await client.query(
        `INSERT INTO project_floor_plans 
         (project_id, floor_plan_url, tagged_floor_plan_url) 
         VALUES ($1, $2, $3)`,
        [projectId, updatedOriginalFloorPlanUrl, updatedTaggedFloorPlanUrl]
      );
    }

    // 3. Store rooms data
    for (const room of rooms) {
      const roomResult = await client.query(
        `INSERT INTO project_rooms 
         (project_id, room_type, square_footage, length, width, height) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING id`,
        [
          projectId,
          room.type,
          room.dimensions.squareFootage,
          room.dimensions.length,
          room.dimensions.width,
          room.dimensions.height
        ]
      );

      const roomId = roomResult.rows[0].id;

      // Store room design preferences
      await client.query(
        `INSERT INTO room_design_preferences 
         (room_id, style, description) 
         VALUES ($1, $2, $3)`,
        [
          roomId,
          room.designPreferences.style,
          room.designPreferences.description
        ]
      );

      // Move and store inspiration photos
      if (room.designPreferences.inspirationPhotos?.length > 0) {
        const updatedInspirationUrls = await Promise.all(
          room.designPreferences.inspirationPhotos.map(url => copyFileToProjectFolder(url))
        );

        const inspirationPhotoValues = updatedInspirationUrls
          .filter(url => url) // Remove any null values
          .map(url => `(${roomId}, '${url}', 'inspiration')`)
          .join(', ');

        if (inspirationPhotoValues) {
          await client.query(`
            INSERT INTO room_photos 
            (room_id, photo_url, photo_type)
            VALUES ${inspirationPhotoValues}
          `);
        }
      }

      // Move and store existing room photos
      if (room.designPreferences.existingPhotos?.length > 0) {
        const updatedExistingUrls = await Promise.all(
          room.designPreferences.existingPhotos.map(url => copyFileToProjectFolder(url))
        );

        const existingPhotoValues = updatedExistingUrls
          .filter(url => url) // Remove any null values
          .map(url => `(${roomId}, '${url}', 'existing')`)
          .join(', ');

        if (existingPhotoValues) {
          await client.query(`
            INSERT INTO room_photos 
            (room_id, photo_url, photo_type)
            VALUES ${existingPhotoValues}
          `);
        }
      }
    }

    // Commit transaction
    await client.query('COMMIT');

    // Send success response
    res.status(200).json({
      success: true,
      projectId,
      message: 'Project created successfully'
    });

  } catch (error) {
    // Rollback in case of error
    if (client) {
      await client.query('ROLLBACK');
    }
    
    console.error('Error creating project:', error);
    res.status(500).json({
      error: 'Failed to create project',
      details: error.message
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// Add this endpoint before the catch-all route in server.js
app.get('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization?.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, 'secret-key');
    
    // First, check if the user has access to this project
    if (decoded.userType !== 'admin') {
    const accessCheck = await pool.query(`
      SELECT p.id 
      FROM projects p
      WHERE p.id = $1
      AND (
        -- User is the project owner
        p.user_id = (SELECT id FROM users WHERE email = $2)
        OR 
        -- User is the assigned designer
        p.designer_id = (SELECT id FROM users WHERE email = $2)
      )
    `, [id, decoded.username]);

    if (accessCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
      }
    }

    // Get project details including rooms and floor plans
    const result = await pool.query(`
      SELECT 
        p.*,
        pf.floor_plan_url,
        pf.tagged_floor_plan_url,
        u.email as client_email,
        json_agg(
          DISTINCT jsonb_build_object(
            'id', pr.id,
            'type', pr.room_type,
            'square_footage', pr.square_footage,
            'length', pr.length,
            'width', pr.width,
            'height', pr.height,
            'design_preferences', (
              SELECT jsonb_build_object(
                'style', rdp.style,
                'description', rdp.description
              )
              FROM room_design_preferences rdp
              WHERE rdp.room_id = pr.id
            ),
            'existing_photos', (
              SELECT json_agg(
                jsonb_build_object('photo_url', rp.photo_url)
              )
              FROM room_photos rp
              WHERE rp.room_id = pr.id AND rp.photo_type = 'existing'
            ),
            'inspiration_photos', (
              SELECT json_agg(
                jsonb_build_object('photo_url', rp.photo_url)
              )
              FROM room_photos rp
              WHERE rp.room_id = pr.id AND rp.photo_type = 'inspiration'
            )
          )
        ) as rooms,
        (
          SELECT json_agg(
            jsonb_build_object(
              'id', pfd.id,
              'design_url', pfd.design_url
            )
          )
          FROM project_final_designs pfd
          WHERE pfd.project_id = p.id
        ) as final_designs
      FROM projects p
      LEFT JOIN project_floor_plans pf ON p.id = pf.project_id
      LEFT JOIN project_rooms pr ON p.id = pr.project_id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = $1
      GROUP BY p.id, pf.floor_plan_url, pf.tagged_floor_plan_url, u.email
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Clean up null arrays
    const project = result.rows[0];
    if (project.rooms[0] === null) {
      project.rooms = [];
    }
    if (project.final_designs === null) {
      project.final_designs = [];
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching project details:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add these endpoints to server.js

// Get comments for a specific design
app.get('/api/projects/:projectId/designs/:designId/comments', async (req, res) => {
  const { projectId, designId } = req.params;
  const token = req.headers.authorization?.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, 'secret-key');
    
    const result = await pool.query(`
      SELECT 
        dc.id,
        dc.comment_text,
        dc.created_at,
        u.email as user_email
      FROM design_comments dc
      JOIN users u ON dc.user_id = u.id
      WHERE dc.project_id = $1 AND dc.design_id = $2
      ORDER BY dc.created_at DESC
    `, [projectId, designId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching design comments:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add a comment to a design
app.post('/api/projects/:projectId/designs/:designId/comments', async (req, res) => {
  const { projectId, designId } = req.params;
  const { comment_text } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, 'secret-key');
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [decoded.username]
    );
    const userId = userResult.rows[0].id;
    
    const result = await pool.query(`
      INSERT INTO design_comments 
        (project_id, design_id, user_id, comment_text, created_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING id, created_at
    `, [projectId, designId, userId, comment_text]);
    
    res.status(201).json({
      id: result.rows[0].id,
      created_at: result.rows[0].created_at,
      user_email: decoded.username,
      comment_text
    });
  } catch (error) {
    console.error('Error adding design comment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's projects
// Get projects based on user role
app.get('/api/projects', async (req, res) => {
  console.log("Requesting all projects...");
  const token = req.headers.authorization?.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, 'secret-key');
    const userType = decoded.userType; // Get user type from token
    console.log('User type:', userType);

    // Base query that's common for both roles
    const baseQuery = `
      SELECT 
        p.*,
        pf.floor_plan_url,
        pf.tagged_floor_plan_url,
        u.email as client_email,
        (
          SELECT json_agg(
            jsonb_build_object(
              'id', pfd.id,
              'design_url', pfd.design_url,
              'created_at', pfd.created_at
            )
          )
          FROM project_final_designs pfd
          WHERE pfd.project_id = p.id
        ) as final_designs,
        json_agg(
          DISTINCT jsonb_build_object(
            'id', pr.id,
            'type', pr.room_type,
            'square_footage', pr.square_footage,
            'length', pr.length,
            'width', pr.width,
            'height', pr.height,
            'design_preferences', (
              SELECT jsonb_build_object(
                'style', rdp.style,
                'description', rdp.description
              )
              FROM room_design_preferences rdp
              WHERE rdp.room_id = pr.id
            ),
            'existing_photos', (
              SELECT json_agg(
                jsonb_build_object('photo_url', rp.photo_url)
              )
              FROM room_photos rp
              WHERE rp.room_id = pr.id AND rp.photo_type = 'existing'
            ),
            'inspiration_photos', (
              SELECT json_agg(
                jsonb_build_object('photo_url', rp.photo_url)
              )
              FROM room_photos rp
              WHERE rp.room_id = pr.id AND rp.photo_type = 'inspiration'
            )
          )
        ) as rooms
      FROM projects p
      LEFT JOIN project_floor_plans pf ON p.id = pf.project_id
      LEFT JOIN project_rooms pr ON p.id = pr.project_id
      LEFT JOIN users u ON p.user_id = u.id
    `;

    // Different WHERE clauses based on user type
    const whereClause = userType === 'designer' 
      ? `WHERE p.designer_id = (SELECT id FROM users WHERE email = $1)`
      : `WHERE p.user_id = (SELECT id FROM users WHERE email = $1)`;

    const fullQuery = `
      ${baseQuery}
      ${whereClause}
      GROUP BY p.id, pf.floor_plan_url, pf.tagged_floor_plan_url, u.email
      ORDER BY p.created_at DESC
    `;

    const result = await pool.query(fullQuery, [decoded.username]);
    console.log("fetching project details")
    console.log(result)
    // Clean up null arrays in the response
    const projects = result.rows.map(project => ({
      ...project,
      rooms: project.rooms[0] === null ? [] : project.rooms,
      final_designs: project.final_designs === null ? [] : project.final_designs
    }));

    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add these endpoints to server.js

// Upload designer's floor plan version
app.post('/api/designer/projects/:projectId/floor-plan', async (req, res) => {
  const { projectId } = req.params;
  const token = req.headers.authorization?.split(' ')[1];
  
  floorPlanUpload(req, res, async function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    try {
      const decoded = jwt.verify(token, 'secret-key');
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const designerFloorPlanUrl = req.files[0].location;

      const result = await pool.query(`
        UPDATE projects
        SET designer_floor_plan_url = $1,
            last_modified_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `, [designerFloorPlanUrl, projectId]);

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

// Upload final designs
app.post('/api/designer/projects/:projectId/final-designs', async (req, res) => {
  const { projectId } = req.params;
  const token = req.headers.authorization?.split(' ')[1];
  
  imageUpload(req, res, async function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    try {
      const decoded = jwt.verify(token, 'secret-key');
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const designUrls = req.files.map(file => file.location);
      
      // Insert designs and return their IDs
      const insertResults = await Promise.all(
        designUrls.map(url => 
          pool.query(
            `INSERT INTO project_final_designs (project_id, design_url)
             VALUES ($1, $2)
             RETURNING id, design_url, created_at`,
            [projectId, url]
          )
        )
      );

      const designs = insertResults.map(result => ({
        id: result.rows[0].id,
        design_url: result.rows[0].design_url,
        created_at: result.rows[0].created_at
      }));

      // Update project status
      await pool.query(`
        UPDATE projects
        SET status = 'completed',
            completed = true,
            last_modified_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [projectId]);

      res.json({ designs });
    } catch (error) {
      console.error('Error uploading designs:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

// Add these endpoints to server.js
// Get comments for a project
app.get('/api/projects/:projectId/comments', async (req, res) => {
  const { projectId } = req.params;
  const token = req.headers.authorization?.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, 'secret-key');
    
    const result = await pool.query(`
      SELECT 
        fc.id,
        fc.comment_text,
        fc.created_at,
        u.email as user_email
      FROM floor_plan_comments fc
      JOIN users u ON fc.user_id = u.id
      WHERE fc.project_id = $1
      ORDER BY fc.created_at DESC
    `, [projectId]);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Make sure this endpoint exists in server.js
app.post('/api/projects/:projectId/comments', async (req, res) => {
  const { projectId } = req.params;
  const { comment_text } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, 'secret-key');
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [decoded.username]);
    const userId = userResult.rows[0].id;
    
    const result = await pool.query(`
      INSERT INTO floor_plan_comments 
        (project_id, user_id, comment_text)
      VALUES ($1, $2, $3)
      RETURNING id, created_at
    `, [projectId, userId, comment_text]);
    
    res.status(201).json({
      ...result.rows[0],
      user_email: decoded.username,
      comment_text
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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