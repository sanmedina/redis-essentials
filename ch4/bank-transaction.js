const common = require('../common');
const client = common.client;

function transfer(from, to, value, callback) {
    client.get(from, function (err, balance) {
        const multi = client.multi();
        multi.decrby(from, value);
        multi.incrby(to, value);
        if (balance >= value) {
            multi.exec(function (err, reply) {
                callback(null, reply[0]);
            });
        } else {
            multi.discard();
            callback(new Error('Insufficient funds'), null);
        }
    });
}

client.mset("max:checkings", 100, "hugo:checkings", 100, function (err, reply) { // 1
    console.log("Max checkings: 100");
    console.log("Hugo checkings: 100");
    transfer("max:checkings", "hugo:checkings", 40, function (err, balance) { // 2
        if (err) {
            console.log(err);
        } else {
            console.log("Transferred 40 from Max to Hugo")
            console.log("Max balance:", balance);
        }
        client.quit();
    });
});
