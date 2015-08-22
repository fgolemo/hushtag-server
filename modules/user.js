var express = require('express');
var moment = require('moment');
var rest = require('./rest');

module.exports = (function () {
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
        var p = rest.client.zscoreAsync(["userids", name]).then(function (id) {
            if (id == null) {
                console.log("INFO: user " + name + " bad login - doesn't exist");
                res.json({status: "fail", msg: "wrong pass"});
                return p.cancel();
            } else {
                return rest.client.hgetallAsync("user:" + id);
            }
        }).then(function (userData) {
            if (userData.password_hash == hash) {
                console.log("INFO: user " + name + " successfully logged in");
                res.json({status: "success", obj: unpackUserPrivileged(userData)});
            } else {
                console.log("INFO: user " + name + " bad login");
                res.json({status: "fail", msg: "wrong pass"});
            }
        }).error(function (err) {
            console.log("error while trying to login user:" + name);
            console.log(err);
            res.json({status: "fail", msg: "There was a server problem, please try again in an hour or so."});
        }).cancellable();


    }

    function makeUser(name, hash) {
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
        var pwhash = req.body.hash;
        var p = rest.client.sismemberAsync(["usernames", name]).then(function (userExists) {
            if (userExists) {
                console.log("INFO: user " + name + " attempted to sign up, but exists");
                res.json({status: "fail", msg: "name is already taken"});
                return p.cancel();
            } else {
                return rest.client.incrAsync("userID");
            }
        }).then(function (nextID) {
            var obj = makeUser(name, pwhash);
            obj.id = nextID;
            var hash = "user:" + nextID;
            rest.client.multi([
                ["hmset", hash, obj],
                ["zadd", "userids", nextID, name],
                ["sadd", "usernames", name],
                ["sadd", "users", nextID],
                ["set", hash + ":rep:events", 0],
                ["set", hash + ":rep:hushtags", 0],
                ["set", hash + ":rep:locations", 0]
            ]).execAsync().then(function () {
                console.log("INFO: user " + name + " signed up");
                res.json({status: "success", obj: unpackUserPrivileged(obj)});
            }).error(function (err) {
                console.log("error while inserting data for " + hash);
                console.dir(obj);
                console.log(err);
            });
        }).error(function (err) {
            console.log("ERROR: while user " + name + " attempt to sign up");
            res.json({status: "fail", msg: "There was a server problem, please try again in an hour or so."});
        }).cancellable();

    }


    return app;
})();