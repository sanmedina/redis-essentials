const redis = require('redis');

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const client = redis.createClient(6379, REDIS_HOST);

function storeDailyVisit(date, userId) {
    const key = 'visits:daily:' + date;
    client.setbit(key, userId, 1, function(err, reply) {
        console.log('User', userId, 'visited on', date);
    });
}

function countVisits(date) {
    const key = 'visits:daily:' + date;
    client.bitcount(key, function(err, reply) {
        console.log(date, 'had', reply, 'visits.');
    });
}

function showUserIdsFromVisit(date) {
    const key = 'visits:daily:' + date;
    client.get(key, function(err, bitmapValue) {
        let userIds = [];
        // let data = bitmapValue.toJSON().data;
        let data = bitmapValue.split('');

        // data.forEach(function(byte, byteIndex) {
        for (let byteIndex = 0; byteIndex < data.length; ++byteIndex) {
            let byte = data[byteIndex].charCodeAt(0);
            for (let bitIndex = 7; bitIndex >= 0; --bitIndex) {
                let visited = byte >> bitIndex & 1;
                if (visited === 1) {
                    const userId = byteIndex * 8 + (7 - bitIndex);
                    userIds.push(userId);
                }
            }
        };
        console.log('Users ' + userIds + ' visited on ' + date);
    });
}

storeDailyVisit('2015-01-01', '1');
storeDailyVisit('2015-01-01', '2');
storeDailyVisit('2015-01-01', '10');
storeDailyVisit('2015-01-01', '55');

countVisits('2015-01-01');
showUserIdsFromVisit('2015-01-01');

client.quit();
