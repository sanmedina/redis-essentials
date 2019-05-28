module.exports = class Queue {
    constructor(queueName, redisClient) {
        this.queueName = queueName;
        this.redisClient = redisClient;
        this.queueKey = 'queues:' + queueName;
        // zero means no timeout
        this.timeout = 0;
    }

    size(callback) {
        this.redisClient.llen(this.queueKey, callback);
    }

    push(data) {
        this.redisClient.lpush(this.queueKey, data);
    }

    pop(callback) {
        this.redisClient.brpop(this.queueKey, this.timeout, callback);
    }
}
