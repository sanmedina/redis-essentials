const os = require('os');
const redis = require('redis');

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const client = redis.createClient(6379, REDIS_HOST);

let COMMANDS = {};

COMMANDS.DATE = function () {
    const now = new Date();
    console.log('DATE ', now.toISOString());
};

COMMANDS.PING = function () {
    console.log('PONG');
};

COMMANDS.HOSTNAME = function () {
    console.log('HOSTNAME', os.hostname());
};

client.on('message', function (channel, commandName) {
    if (COMMANDS.hasOwnProperty(commandName)) {
        const commandFunc = COMMANDS[commandName];
        commandFunc();
    } else {
        console.log('Unknown command:', commandName);
    }
});
client.subscribe('global', process.argv[process.argv.length - 1]);
