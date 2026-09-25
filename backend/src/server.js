const http = require('http');
const { Server } = require('socket.io');

require('dotenv').config();

const app = require('./app');
require('./config/db'); // Jalankan test koneksi DB


/* =========================================================
   SERVER
   ========================================================= */

const server = http.createServer(app);


/* =========================================================
   SOCKET.IO CORS
   ========================================================= */

const allowedOrigins = [
  'https://sibeb-semar.vercel.app',
  'http://localhost:5173',
];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {

      // Request tanpa origin
      if (!origin) {
        return callback(null, true);
      }

      // Domain utama
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Semua deployment preview Vercel
      // Contoh:
      // https://sibeb-semar-5phs9xf2d-ilmnnf.vercel.app
      if (
        /^https:\/\/sibeb-semar-[a-z0-9-]+\.vercel\.app$/.test(origin)
      ) {
        return callback(null, true);
      }

      // Localhost
      if (/^http:\/\/localhost:\d+$/.test(origin)) {
        return callback(null, true);
      }

      console.log('Socket.IO CORS BLOCKED:', origin);

      return callback(
        new Error(`Socket.IO CORS: origin tidak diizinkan - ${origin}`)
      );
    },

    methods: [
      'GET',
      'POST',
    ],

    credentials: true,
  },
});


/* =========================================================
   SOCKET.IO CONNECTION
   ========================================================= */

io.on('connection', (socket) => {

  console.log('🔌 Client terhubung:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Client terputus:', socket.id);
  });

});


/* =========================================================
   SUPAYA IO BISA DIPAKAI CONTROLLER
   ========================================================= */

app.set('io', io);


/* =========================================================
   PORT
   ========================================================= */

const PORT = process.env.PORT || 5000;


/* =========================================================
   START SERVER
   ========================================================= */

server.listen(PORT, () => {
  console.log(`🚀 Server jalan di http://localhost:${PORT}`);
  console.log('🌐 Socket.IO aktif');
  console.log('🔐 CORS frontend aktif');
});