const redis = require('redis');

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const client = redis.createClient(6379, REDIS_HOST);

const channel = process.argv[process.argv.length - 2];
const command = process.argv[process.argv.length - 1];

client.publish(channel, command);

client.quit();
