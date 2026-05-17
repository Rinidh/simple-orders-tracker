import mongoose from 'mongoose';
import { ConfigurationError } from './errors/configuration-error';

async function connectToDatabase(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new ConfigurationError('MONGODB_URI is not set');
  }

  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');
  });

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  await mongoose.connect(mongoUri);
}

export default connectToDatabase;
