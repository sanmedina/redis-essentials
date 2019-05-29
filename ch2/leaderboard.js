const redis = require('redis');

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const client = redis.createClient(6379, REDIS_HOST);

class LeaderBoard {
    constructor(key) {
        this.key = key;
    }

    addUser(username, score) {
        client.zadd([this.key, score, username], function(err, replies) {
            console.log('User', username, 'added to leaderboard!');
        });
    }

    removeUser(username) {
        client.zrem(this.key, username, function(err, replies) {
            console.log('User', username, 'removed successfully!');
        });
    }

    getUserScoreAndRank(username) {
        const leaderboardKey = this.key;
        client.zscore(leaderboardKey, username, function(err, zscoreReply) {
            client.zrevrank(leaderboardKey, username, function(err, zrevrankReply) {
                console.log('\nDetails of', username, ':');
                console.log('Score:', zscoreReply, ', Rank: #', (zrevrankReply + 1));
            });
        });
    }

    showTopUsers(quantity) {
        client.zrevrange([this.key, 0, quantity - 1, 'WITHSCORES'], function(err, reply) {
            console.log('\nTop', quantity, 'users:');
            for (let i = 0, rank = 1; i < reply.length; i += 2, ++rank) {
                console.log('#' + rank, 'User:' + reply[i] + ', score:', reply[i + 1]);
            }
        });
    }

    getUsersAroundUser(username, quantity, callback) {
        const leaderboardKey = this.key;
        client.zrevrank(leaderboardKey, username, function(err, zrevrankReply) {
            const startOffset = Math.floor(zrevrankReply - (quantity / 2) + 1);
            if (startOffset < 0) {
                startOffset = 0;
            }
            const endOffset = startOffset + quantity - 1;
            client.zrevrange([leaderboardKey, startOffset, endOffset, 'WITHSCORES'], function(err, zrevrangeReply) {
                let users = [];
                for (let i = 0, rank = 1; i < zrevrangeReply.length; i += 2, ++rank) {
                    let user = {
                        rank: startOffset + rank,
                        score: zrevrangeReply[i + 1],
                        username: zrevrangeReply[i],
                    };
                    users.push(user);
                }
                callback(users);
            });
        });
    }
}

var leaderBoard = new LeaderBoard("game-score");
leaderBoard.addUser("Arthur", 70);
leaderBoard.addUser("KC", 20);
leaderBoard.addUser("Maxwell", 10);
leaderBoard.addUser("Patrik", 30);
leaderBoard.addUser("Ana", 60);
leaderBoard.addUser("Felipe", 40);
leaderBoard.addUser("Renata", 50);
leaderBoard.addUser("Hugo", 80);
leaderBoard.removeUser("Arthur");

leaderBoard.getUserScoreAndRank("Maxwell");

leaderBoard.showTopUsers(3);

leaderBoard.getUsersAroundUser("Felipe", 5, function(users) { // 1
  console.log("\nUsers around Felipe:");
  users.forEach(function(user) {
    console.log("#" + user.rank, "User:", user.username + ", score:", user.score);
  });
  client.quit(); // 2
});
