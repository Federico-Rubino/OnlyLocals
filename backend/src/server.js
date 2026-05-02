require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
      // connessione a MongoDB
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB connesso');
  
      // avvio server SOLO dopo connessione
      app.listen(PORT, () => {
        console.log('Server running on port', PORT);
      });
  
    } catch (error) {
      console.error('Errore connessione DB:', error.message);
      process.exit(1);
    }
  }
  
  startServer();