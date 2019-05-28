const redis = require('redis');

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const client = redis.createClient(6379, REDIS_HOST);

function upVote(id) {
    const key = 'article:' + id + ':votes';
    client.incr(key);
}

function downVote(id) {
    const key = 'article:' + id + ':votes';
    client.decr(key);
}

function showResults(id) {
    const headlineKey = 'article:' + id + ':headline';
    const voteKey = 'article:' + id + ':votes';
    client.mget([headlineKey, voteKey], function(err, replies) {
        console.log(`The article "${replies[0]}" has ${replies[1]} votes`);
    });
}

upVote(12345); // article:12345 has 1 vote
upVote(12345); // article:12345 has 2 votes
upVote(12345); // article:12345 has 3 votes
upVote(10001); // article:10001 has 1 vote
upVote(10001); // article:10001 has 2 votes
downVote(10001); // article:10001 has 1 vote
upVote(60056); // article:60056 has 1 vote

showResults(12345);
showResults(10001);
showResults(60056); 

client.quit();
