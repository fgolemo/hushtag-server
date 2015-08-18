var redis = require('redis');
var url = require('url');
var redisURL = url.parse(process.env.REDISCLOUD_URL || "redis://user:foobared@127.0.0.1:6379");
var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
client.auth(redisURL.auth.split(":")[1]);

module.exports = {
    client: client,
    getAll: function (key, res, next, unpacker) {
        this.getIDs(key + "s", function (ids) {
            var multiQuery = [];
            ids.forEach(function (id, index) {
                multiQuery.push(["hgetall", key + ":" + id.toString()]);
            });
            client.multi(multiQuery).exec(function (err, replies) {
                if (err) {
                    console.log("error during multiquery, key:" + key);
                    console.log(err);
                } else {
                    var out = [];
                    replies.forEach(function (obj, index) {
                        out.push(unpacker(obj));
                    });
                    res.json(out);
                }
            });
        });
    },

    createDetail: function (key, obj, res, next, unpacker) {
        client.incr(key + "ID", function (err, nextID) {
            if (err) {
                console.log("error while incrementing IDs for " + key);
                console.log(err);
            } else {
                obj.id = nextID;
                var hash = key + ":" + nextID;
                client.multi([
                    ["hmset", hash, obj],
                    ["sadd", key + "s", nextID]
                ]).exec(function (err) {
                        if (err) {
                            console.log("error while inserting data for " + hash);
                            console.dir(obj);
                            console.log(err);
                        } else {
                            res.json({status: "success", obj: unpacker(obj)});
                        }
                    }
                );
            }
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
        client.srem(key + "s", id, function (err) {
            if (err) {
                console.log("error while deleting id " + id + " for " + key);
                console.log(err);
            } else {
                res.json({status: "success", id: id});
            }
        });
    },

    getIDs: function (key, cb) {
        client.smembers(key, function (err, obj) {
            if (err) {
                console.log("error while looking for set members of " + key);
                console.log(err);
            } else {
                cb(obj);
            }
        });
    },

    getDetail: function (key, id, res, next, unpacker) {
        var hash = key + ":" + id;
        client.hgetall(hash, function (err, obj) {
            if (err) {
                console.log("error while looking for hash:" + hash);
                console.log(err);
            } else {
                res.json(unpacker(obj));
            }
        });
    }
};

