const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
require('dotenv').config();
require('./config/db'); // Jalankan test koneksi DB

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (process.env.CLIENT_URL || 'http://localhost:5173')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  },
});

io.on('connection', (socket) => {
  console.log('🔌 Client terhubung:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Client terputus:', socket.id);
  });
});

// Supaya io bisa dipakai di controller lain nanti
app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server jalan di http://localhost:${PORT}`);
});