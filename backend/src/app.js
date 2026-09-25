const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();

/* =========================================================
   CORS CONFIGURATION
   ========================================================= */

// Domain yang selalu diizinkan
const allowedOrigins = [
  'https://sibeb-semar.vercel.app',
  'http://localhost:5173',
];

console.log('======================================');
console.log('CORS CONFIGURATION');
console.log('Allowed origins:', allowedOrigins);
console.log('======================================');


/* =========================================================
   HELMET
   ========================================================= */

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },

    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        baseUri: ["'self'"],

        fontSrc: [
          "'self'",
          'https:',
          'data:',
        ],

        formAction: [
          "'self'",
        ],

        frameAncestors: [
          "'self'",
        ],

        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'http:',
          'https:',
        ],

        objectSrc: [
          "'none'",
        ],

        scriptSrc: [
          "'self'",
        ],

        scriptSrcAttr: [
          "'none'",
        ],

        styleSrc: [
          "'self'",
          'https:',
          "'unsafe-inline'",
        ],

        // Jangan paksa HTTP menjadi HTTPS pada development
        upgradeInsecureRequests: null,
      },
    },
  })
);


/* =========================================================
   CORS
   ========================================================= */

const corsOptions = {
  origin: (origin, callback) => {

    // -----------------------------------------------------
    // Request tanpa Origin
    // -----------------------------------------------------
    // Contoh:
    // - Postman
    // - curl
    // - server-to-server
    // -----------------------------------------------------

    if (!origin) {
      return callback(null, true);
    }


    // -----------------------------------------------------
    // 1. Domain yang sudah terdaftar
    // -----------------------------------------------------

    if (allowedOrigins.includes(origin)) {
      console.log('CORS ALLOWED:', origin);

      return callback(null, true);
    }


    // -----------------------------------------------------
    // 2. Vercel Preview Deployment
    // -----------------------------------------------------
    //
    // Contoh:
    //
    // https://sibeb-semar-5phs9xf2d-ilmnnf.vercel.app
    //
    // https://sibeb-semar-abc123-ilmnnf.vercel.app
    //
    // -----------------------------------------------------

    if (
      /^https:\/\/sibeb-semar-[a-z0-9-]+\.vercel\.app$/.test(origin)
    ) {
      console.log('CORS ALLOWED - Vercel Preview:', origin);

      return callback(null, true);
    }


    // -----------------------------------------------------
    // 3. Localhost
    // -----------------------------------------------------

    if (
      /^http:\/\/localhost:\d+$/.test(origin)
    ) {
      console.log('CORS ALLOWED - Localhost:', origin);

      return callback(null, true);
    }


    // -----------------------------------------------------
    // 4. 127.0.0.1
    // -----------------------------------------------------

    if (
      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
    ) {
      console.log('CORS ALLOWED - 127.0.0.1:', origin);

      return callback(null, true);
    }


    // -----------------------------------------------------
    // 5. IP lokal 192.168.x.x
    // -----------------------------------------------------

    if (
      /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin)
    ) {
      console.log('CORS ALLOWED - Local IP:', origin);

      return callback(null, true);
    }


    // -----------------------------------------------------
    // 6. IP lokal 10.x.x.x
    // -----------------------------------------------------

    if (
      /^http:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/.test(origin)
    ) {
      console.log('CORS ALLOWED - Local IP:', origin);

      return callback(null, true);
    }


    // -----------------------------------------------------
    // 7. IP lokal 172.16.x.x - 172.31.x.x
    // -----------------------------------------------------

    if (
      /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+(:\d+)?$/.test(origin)
    ) {
      console.log('CORS ALLOWED - Local IP:', origin);

      return callback(null, true);
    }


    // -----------------------------------------------------
    // Origin tidak diizinkan
    // -----------------------------------------------------

    console.log('======================================');
    console.log('CORS BLOCKED');
    console.log('Origin:', origin);
    console.log('======================================');

    return callback(
      new Error(
        `CORS: origin tidak diizinkan - ${origin}`
      )
    );
  },


  // -------------------------------------------------------
  // HTTP Methods
  // -------------------------------------------------------

  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
  ],


  // -------------------------------------------------------
  // Headers
  // -------------------------------------------------------

  allowedHeaders: [
    'Content-Type',
    'Authorization',
  ],


  // -------------------------------------------------------
  // Credentials
  // -------------------------------------------------------

  credentials: true,


  // -------------------------------------------------------
  // Preflight
  // -------------------------------------------------------

  optionsSuccessStatus: 204,
};


/*
 * Pasang CORS SEBELUM route-route API.
 */
app.use(cors(corsOptions));


/* =========================================================
   BODY PARSER
   ========================================================= */

app.use(
  express.json({
    limit: '1mb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '1mb',
  })
);


/* =========================================================
   UPLOADS
   ========================================================= */

// File upload dapat diakses:
// /uploads/nama-file.jpg

app.use(
  '/uploads',
  express.static(
    path.join(__dirname, '../uploads')
  )
);


/* =========================================================
   HEALTH CHECK
   ========================================================= */

app.get('/api/health', (req, res) => {

  res.status(200).json({
    status: 'ok',
    message: 'Server backend berjalan',
    cors: {
      enabled: true,
      mainOrigin: 'https://sibeb-semar.vercel.app',
      vercelPreview: true,
    },
  });

});


/* =========================================================
   AUTH ROUTES
   ========================================================= */

const authRoutes = require('./routes/authRoutes');

app.use(
  '/api/auth',
  authRoutes
);


/* =========================================================
   REPORT ROUTES
   ========================================================= */

const reportRoutes = require('./routes/reportRoutes');

app.use(
  '/api/reports',
  reportRoutes
);


/* =========================================================
   INVENTORY ROUTES
   ========================================================= */

const inventoryRoutes = require('./routes/inventoryRoutes');

app.use(
  '/api/inventory',
  inventoryRoutes
);


/* =========================================================
   VEHICLE ROUTES
   ========================================================= */

const vehicleRoutes = require('./routes/vehicleRoutes');

app.use(
  '/api/vehicles',
  vehicleRoutes
);


/* =========================================================
   ACTIVITY ROUTES
   ========================================================= */

const activityRoutes = require('./routes/activityRoutes');

app.use(
  '/api/activities',
  activityRoutes
);


/* =========================================================
   INFO BOARD ROUTES
   ========================================================= */

const infoBoardRoutes = require('./routes/infoBoardRoutes');

app.use(
  '/api/info-board',
  infoBoardRoutes
);


/* =========================================================
   POSKO ROUTES
   ========================================================= */

const poskoRoutes = require('./routes/poskoRoutes');

app.use(
  '/api/posko',
  poskoRoutes
);


/* =========================================================
   DISASTER RECORDS ROUTES
   ========================================================= */

const disasterRoutes = require('./routes/disasterRoutes');

app.use(
  '/api/disaster-records',
  disasterRoutes
);


/* =========================================================
   USER ROUTES
   ========================================================= */

const userRoutes = require('./routes/userRoutes');

app.use(
  '/api/users',
  userRoutes
);


/* =========================================================
   PROFILE ROUTES
   ========================================================= */

const profileRoutes = require('./routes/profileRoutes');

app.use(
  '/api/profile',
  profileRoutes
);


/* =========================================================
   PUBLIC ROUTES
   ========================================================= */

const publicRoutes = require('./routes/publicRoutes');

app.use(
  '/api/public',
  publicRoutes
);


/* =========================================================
   BIDANG 3 ROUTES
   ========================================================= */

const bidang3Routes = require('./routes/bidang3Routes');

app.use(
  '/api/bidang3',
  bidang3Routes
);


/* =========================================================
   WATER DISTRIBUTION ROUTES
   ========================================================= */

const waterDistributionRoutes = require(
  './routes/waterDistributionRoutes'
);

app.use(
  '/api/water-distributions',
  waterDistributionRoutes
);


/* =========================================================
   WATER SUPPLY SETTINGS ROUTES
   ========================================================= */

const waterSupplySettingsRoutes = require(
  './routes/waterSupplySettingsRoutes'
);

app.use(
  '/api/water-supply-settings',
  waterSupplySettingsRoutes
);


/* =========================================================
   UNEXPECTED EXPENDITURES ROUTES
   ========================================================= */

const unexpectedExpenditureRoutes = require(
  './routes/unexpectedExpenditureRoutes'
);

app.use(
  '/api/unexpected-expenditures',
  unexpectedExpenditureRoutes
);


/* =========================================================
   BTT PENERIMA ROUTES
   ========================================================= */

const bttPenerimaRoutes = require(
  './routes/bttPenerimaRoutes'
);

app.use(
  '/api/btt-penerima',
  bttPenerimaRoutes
);


/* =========================================================
   LOCATION ROUTES
   ========================================================= */

const locationRoutes = require(
  './routes/locationRoutes'
);

app.use(
  '/api/locations',
  locationRoutes
);


/* =========================================================
   404 HANDLER
   ========================================================= */

app.use((req, res) => {

  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan',
    method: req.method,
    path: req.originalUrl,
  });

});


/* =========================================================
   GLOBAL ERROR HANDLER
   ========================================================= */

app.use((err, req, res, next) => {

  console.error('======================================');
  console.error('SERVER ERROR');
  console.error('Message:', err.message);
  console.error('Code:', err.code);
  console.error('Method:', req.method);
  console.error('URL:', req.originalUrl);
  console.error('======================================');


  /* -------------------------------------------------------
     CORS ERROR
     ------------------------------------------------------- */

  if (
    err.message &&
    err.message.startsWith('CORS:')
  ) {

    return res.status(403).json({
      success: false,
      message: err.message,
    });

  }


  /* -------------------------------------------------------
     MULTER FILE SIZE
     ------------------------------------------------------- */

  if (
    err.code === 'LIMIT_FILE_SIZE'
  ) {

    const isWaterDistribution =
      req.originalUrl?.includes(
        '/water-distributions'
      );

    return res.status(400).json({
      success: false,

      message: isWaterDistribution
        ? 'Foto dokumentasi maksimal 2 MB'
        : 'Ukuran foto maksimal 5MB per file',
    });

  }


  /* -------------------------------------------------------
     MULTER FILE COUNT
     ------------------------------------------------------- */

  if (
    err.code === 'LIMIT_FILE_COUNT' ||
    err.code === 'LIMIT_UNEXPECTED_FILE'
  ) {

    return res.status(400).json({
      success: false,
      message: 'Maksimal 5 foto',
    });

  }


  /* -------------------------------------------------------
     DEFAULT ERROR
     ------------------------------------------------------- */

  return res.status(
    err.status || 500
  ).json({

    success: false,

    message:
      err.message ||
      'Terjadi kesalahan server',

  });

});


/* =========================================================
   EXPORT APP
   ========================================================= */

module.exports = app;