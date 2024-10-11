// db.js
const mongoose = require('mongoose');

let isConnected;

const connectToDatabase = async () => {
  if (isConnected) {
    return Promise.resolve();
  }

  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  isConnected = mongoose.connection.readyState;
};

module.exports = connectToDatabase;
