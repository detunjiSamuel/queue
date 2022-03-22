import { createClient } from 'redis';
import config from '.';

const { url } = config.redis;

class Client {
  client: any;
  constructor() {
    this.client = createClient({ url });
    this.client.on('error', (err) => console.log('Redis Client Error', err));

    this.client.connect().then((e) => {
      console.log('connected');
    });
  }

  async add(key: String, value: String): Promise<string> {
    return await this.client.set(key, value);
  }

  async get(key: String): Promise<string> {
    return await this.client.get(key);
  }

  async delete(key: String): Promise<string> {
    return await this.client.getDel(key);
  }

  async kill() {
    return this.client.disconnect();
  }
}

export default Client;
