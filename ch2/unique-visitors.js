const redis = require('redis');

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const client = redis.createClient(6379, REDIS_HOST);

function addVisit(date, user) {
    const key = 'visits:' +  date;
    client.pfadd(key, user);
}

function count(dates) {
    const keys = [];
    dates.forEach(function(date, index) {
        keys.push('visits:' + date);
    });

    client.pfcount(keys, function(err, reply) {
        console.log('Date', date.join(','), 'had', reply, 'visits');
    });
}

function aggregateDate(date) {
    let keys = ['visits:' + date];
    for (let i = 0; i < 24; ++i) {
        keys.push('visits:' + date + 'T' + i);
    }
    client.pfmerge(keys, function (err, reply) {
        console.log('Aggregated date', date);
    });
}

const MAX_USERS = 200;
const TOTAL_VISITS = 1000;

for (let i = 0; i < TOTAL_VISITS; ++i) {
    const username = 'user_' + Math.floor(1 + Math.random() * MAX_USERS);
    const hour = Math.floor(Math.random() * 24);
    addVisit('2015-01-01T' + hour, username);
}

count(['2015-01-01T0']); // 7
count(['2015-01-01T5', '2015-01-01T6', '2015-01-01T7']); // 8

aggregateDate('2015-01-01'); // 9
count(['2015-01-01']); // 10

client.quit();
