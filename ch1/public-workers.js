const redis = require('redis');
const Queue = require('./queue');

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const client = redis.createClient(6379, REDIS_HOST);
const logsQueue = new Queue('logs', client);
const MAX = 5;

for (let i = 0; i < MAX; ++i) {
    logsQueue.push('Hello world #' + i);
}
console.log('Created ', MAX, ' logs');
client.quit();
