const common = require('../common');
const client = common.client;

function zpop(key, callback) {
    client.watch(key, function (watchErr, watch) {
        client.zrange(key, 0, 0, function (zrangeErr, zrangeReply) {
            const multi = client.multi();
            multi.zrem(key, zrangeReply);
            multi.exec(function (transactionErr, transactionReply) {
                if (transactionReply) {
                    callback(zrangeReply[0]);
                } else {
                    zpop(key, callback);
                }
            });
        });
    });
}

client.zadd("presidents", 1732, "George Washington");
client.zadd("presidents", 1809, "Abraham Lincoln");
client.zadd("presidents", 1858, "Theodore Roosevelt");

zpop("presidents", function(member) {
  console.log("The first president in the group is:", member);
  client.quit();
});
