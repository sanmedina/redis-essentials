const redis = require('redis');
const Queue = require('./queue');

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const client = redis.createClient(6379, REDIS_HOST);
const logsQueue = new Queue('logs', client);

function logMessages() {
    logsQueue.pop(function(err, replies) {
        const queueName = replies[0];
        const message = replies[1];
        console.log('[consumer] Got log:', message);
        
        logsQueue.size(function(err, size) {
            console.log(size, 'logs left');
        });

        logMessages();
    });
}

logMessages();
