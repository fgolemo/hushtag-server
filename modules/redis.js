var Promise = require("bluebird");
var redis = require('redis');
Promise.promisifyAll(redis);
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);
var url = require('url');
var redisURL = url.parse(process.env.REDISCLOUD_URL || "redis://user:foobared@127.0.0.1:6379");
var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
client.auth(redisURL.auth.split(":")[1]);

module.exports = {
    client: client
}