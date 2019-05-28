const redis = require('redis');

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const client = redis.createClient(6379, REDIS_HOST);
client.set('my_key', 'Hello World using Node.js and Redis');
client.get('my_key', redis.print);
client.quit();
