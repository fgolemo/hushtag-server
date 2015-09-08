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
    client: client,
    getAll: function (key, res, next, unpacker) {
        this.getIDs(key + "s", function (ids) {
            var multi = client.multi();
            ids.forEach(function (id, index) {
                multi.hgetallAsync(key + ":" + id.toString());
            });
            multi.execAsync().then(function (replies) {
                var out = [];
                replies.forEach(function (obj, index) {
                    out.push(unpacker(obj));
                });
                return out;
            }).then(function (data) {
                res.json(data);
            }).error(function (err) {
                console.log("error during multiquery, key:" + key);
                console.log(err);
            });
        });
    },

    createDetail: function (key, obj, res, next, unpacker) {
        client.incrAsync(key + "ID").then(function (nextID) {
            obj.id = nextID;
            var hash = key + ":" + nextID;
            return client.multi([
                ["hmset", hash, obj],
                ["sadd", key + "s", nextID]
            ]).execAsync();
        }).then(function () {
            res.json({status: "success", obj: unpacker(obj)});
        }).error(function (err) {
            console.log("error while inserting data for " + hash);
            console.dir(obj);
            console.log(err);
        });

    },

    updateDetail: function (key, id, obj, res, next, unpacker) {
        obj.id = id;
        var hash = key + ":" + id;
        client.hmset(hash, obj, function (err) {
            if (err) {
                console.log("error while updating data for " + hash);
                console.dir(obj);
                console.log(err);
            } else {
                res.json({status: "success", obj: unpacker(obj)});
            }
        });
    },

    deleteDetail: function (key, id, res, next) {
        client.sremAsync(key + "s", id).then(function () {
            res.json({status: "success", id: id});
        }).error(function (err) {
            console.log("error while deleting id " + id + " for " + key);
            console.log(err);
        });
    },

    getIDs: function (key, cb) {
        client.smembersAsync(key).then(function (obj) {
            cb(obj);
        }).error(function (err) {
            console.log("error while looking for set members of " + key);
            console.log(err);
        });
    },

    getDetail: function (key, id, res, next, unpacker) {
        var hash = key + ":" + id;
        client.hgetallAsync(hash).then(function (obj) {
            res.json(unpacker(obj));
        }).error(function (err) {
            console.log("error while looking for hash:" + hash);
            console.log(err);
        });
    }
};

