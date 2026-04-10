const mongoose = require('mongoose');

const mainDbConnection = mongoose.createConnection(process.env.MAIN_MONGODB_URI);

mainDbConnection.on('connected', () => {
  console.log('Connected to DGI Main Database');
});

mainDbConnection.on('error', (err) => {
  console.error('DGI Main Database Connection Error:', err);
});

module.exports = mainDbConnection;
