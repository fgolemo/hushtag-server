var redis = require("./redis");
var commentHelper = require('./commentHelper');

module.exports = {
    getAll: function (key, res, next, unpacker) {
        this.getIDs(key + "s", function (ids) {
            console.log("INFO: getting all" + key + "s");
            var multi = redis.client.multi();
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
        redis.client.incrAsync(key + "ID").then(function (nextID) {
            obj.id = nextID;
            var hash = key + ":" + nextID;
            return redis.client.multi([
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
        console.dir(obj);
        redis.client.hmset(hash, obj, function (err) {
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
        redis.client.sremAsync(key + "s", id).then(function () {
            res.json({status: "success", id: id});
        }).error(function (err) {
            console.log("error while deleting id " + id + " for " + key);
            console.log(err);
        });
    },

    getIDs: function (key, cb) {
        redis.client.smembersAsync(key).then(function (obj) {
            cb(obj);
        }).error(function (err) {
            console.log("error while looking for set members of " + key);
            console.log(err);
        });
    },

    getDetail: function (key, id, res, next, unpacker) {
        var hash = key + ":" + id;
        console.log("INFO: getting " + hash);
        redis.client.hgetallAsync(hash).then(function (obj) {
            res.json(unpacker(obj));
        }).error(function (err) {
            console.log("error while looking for hash:" + hash);
            console.log(err);
        });
    },

    postComment: function (key, id, obj, res, next) {
        var hashParent = key + ":" + id + ":comments";
        obj = commentHelper.packer(obj);
        console.log("INFO: posting comments for " + hashParent);
        redis.client.incrAsync("commentID").then(function (nextID) {
            obj.id = nextID;
            var hashComment = "comment:" + nextID;
            return redis.client.multi([
                ["hmset", hashComment, obj],
                ["sadd", "comments", nextID],
                ["sadd", hashParent, nextID]
            ]).execAsync();
        }).then(function () {
            res.json({status: "success", obj: commentHelper.unpacker(obj)});
        }).error(function (err) {
            console.log("error while inserting comment for " + hashParent);
            console.dir(obj);
            console.log(err);
        });
    },

    getComments: function (key, id, res, next) {
        var hash = key + ":" + id + ":comments";
        console.log("INFO: getting comments for " + hash);
        redis.client.smembersAsync(hash).then(function (ids) {

            var multi = redis.client.multi();
            ids.forEach(function (id, index) {
                multi.hgetallAsync("comment:" + id.toString());
            });
            multi.execAsync().then(function (replies) {
                var out = [];
                replies.forEach(function (obj, index) {
                    out.push(commentHelper.unpacker(obj));
                });
                return out;
            }).then(function (data) {
                res.json(data);
            }).error(function (err) {
                console.log("error while retrieving comment details for hash:" + hash);
                console.log(err);
            });

        }).error(function (err) {
            console.log("error while retrieving comment IDs for hash:" + hash);
            console.log(err);
        });
    },

    deleteComment: function (key, id, cid, res, next) {
        var hashParent = key + ":" + id + ":comments";
        var multi = redis.client.multi([
            ["srem", hashParent, cid],
            ["srem", "commentID", cid]
        ]);
        multi.execAsync().then(function (data) {
            res.json({status: "success", id: id, cid: cid});
        }).error(function (err) {
            console.log("error while deleting comment " + cid + " for obj " + key + ":" + id);
            console.log(err);
        });
    }
};

