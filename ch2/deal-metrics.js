const redis = require('redis');

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const client = redis.createClient(6379, REDIS_HOST);

function markDealAsSent(dealId, userId) {
    client.sadd(dealId, userId);
}

function sendDealIfNotSent(dealId, userId) {
    client.sismember(dealId, userId, function(err, reply) {
        if (reply) {
            console.log('Deal', dealId, 'was already sent to user', userId);
        } else {
            console.log('Sending', dealId, 'to user', userId);
            // send
            markDealAsSent(dealId, userId);
        }
    });
}

function showUsersThatRecieivedAllDeals(dealIds) {
    client.sinter(dealIds, function(err, reply) {
        console.log(reply, 'received all of the deals:', dealIds);
    });
}

function showUsersThatReceivedAtLeastOneOfTheDeal(dealIds) {
    client.sunion(dealIds, function(err, reply) {
        console.log(reply, 'received at least one of the deals:', dealIds);
    });
}

markDealAsSent('deal:1', 'user:1');
markDealAsSent('deal:1', 'user:2');
markDealAsSent('deal:2', 'user:1');
markDealAsSent('deal:2', 'user:3');

sendDealIfNotSent('deal:1', 'user:1')
sendDealIfNotSent('deal:1', 'user:2')
sendDealIfNotSent('deal:1', 'user:3')

showUsersThatRecieivedAllDeals(['deal:1', 'deal:2']);
showUsersThatReceivedAtLeastOneOfTheDeal(['deal:1', 'deal:2']);

client.quit();
