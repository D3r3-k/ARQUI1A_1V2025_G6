import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI;
const options = {};

if (!uri) {
  throw new Error('Por favor define MONGODB_URI en .env.local');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export default clientPromise;
