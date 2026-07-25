const mongoose = require('mongoose');

/**
 * Establishes a connection to MongoDB Atlas using Mongoose.
 * Exits the process on failure so the app never runs in a half-connected state.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Modern mongoose (6+/8+) no longer needs useNewUrlParser/useUnifiedTopology,
      // they are defaults, but kept here as explicit documentation of intent.
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect is handled by the driver.');
    });
  } catch (error) {
    console.error(`Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
