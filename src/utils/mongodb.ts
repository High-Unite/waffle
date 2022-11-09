import type { MongoClientOptions, DbOptions } from 'mongodb';
import { MongoClient } from 'mongodb';

export default class MongoBridge {
  private dbClient: MongoClient | undefined = void 0;
  private connectionString: string;

  constructor(connectionString: string, options?: MongoClientOptions) {
    if (!connectionString)
      throw new Error('MongoDB: Connection string cannot be empty or null-ish');

    this.connectionString = connectionString;
    this.dbClient = new MongoClient(this.connectionString, options);
  }

  async db(database: string, options?: DbOptions) {
    if (!this.dbClient) throw new Error('MongoDB: Client is undefined');
    return (await this.dbClient.connect()).db(database, options);
  }
}
