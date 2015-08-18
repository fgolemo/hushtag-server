var express = require('express');
var moment = require('moment');
var rest = require('./rest');

module.exports = (function() {
    'use strict';
    var app = express.Router();

    app.get('/user/:id', getUser);

    function unpackUser(obj) {
        obj.password_hash = "";
        delete obj.lastloggedin;
        delete obj.created;
        obj.contact = "";
        return obj;
    }

    function unpackUserPrivileged(obj) { // only called when user = self
        obj.password_hash = "";
        obj.lastloggedin = moment(obj.lastloggedin);
        obj.created = moment(obj.created);
        return obj;
    }

    function getUser(req, res, next) {
        var id = req.params.id;
        rest.getDetail("user", id, res, next, unpackUser);
    }

    // ===== LOGIN

    app.post('/login', login);
    app.post('/signup', signup);


    function login(req, res, next) {
        var name = req.body.name;
        var hash = req.body.hash;
        rest.client.zscore(["userids", name], function (err, obj) {
            if (err) {
                console.log("error while looking up score for user:" + name);
                console.log(err);
            } else {
                if (obj == null) {
                    res.json({status: "fail", msg: "wrong pass"});
                } else {
                    rest.getDetail("user", obj, res, next, function (userData) {
                        if (userData.password_hash == hash) {
                            console.log("INFO: user "+name+" successfully logged in");
                            return {status: "success", obj: unpackUserPrivileged(userData)};
                        } else {
                            console.log("INFO: user "+name+" bad login");
                            return {status: "fail", msg: "wrong pass"};
                        }
                    });
                }

            }
        });
    }

    function makeUser (name, hash) {
        var d = new Date();
        return {
            name: name,
            password_hash: hash,
            avatar: "",
            created: d.toISOString(),
            lastloggedin: d.toISOString(),
            contact: ""
        };
    }

    function signup(req, res, next) {
        var name = req.body.name;
        var hash = req.body.hash;
        rest.client.sismember(["usernames", name], function(err, userExists) {
            if (err) {
                console.log("error while looking up if username exists:" + name);
                console.log(err);
            } else {
                if (userExists) {
                    console.log("INFO: user "+name+" attempted to sign up, but exists");
                    res.json({status: "fail", msg: "name is already taken"});
                } else {
                    var obj = makeUser(name, hash);
                    rest.client.incr("userID", function (err, nextID) {
                        if (err) {
                            console.log("error while incrementing IDs for user");
                            console.log(err);
                        } else {
                            obj.id = nextID;
                            var hash = "user:" + nextID;
                            rest.client.multi([
                                ["hmset", hash, obj],
                                ["zadd", "userids", nextID, name],
                                ["sadd", "usernames", name],
                                ["sadd", "users", nextID]
                            ]).exec(function (err) {
                                    if (err) {
                                        console.log("error while inserting data for " + hash);
                                        console.dir(obj);
                                        console.log(err);
                                    } else {
                                        console.log("INFO: user "+name+" signed up");
                                        res.json({status: "success", obj: unpackUserPrivileged(obj)});
                                    }
                                }
                            );
                        }
                    });
                }
            }
        });
    }


    return app;
})();