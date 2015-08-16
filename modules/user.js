var express = require('express');
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
                            return {status: "success", obj: unpackUserPrivileged(userData)};
                        } else {
                            return {status: "fail", msg: "wrong pass"};
                        }
                    });
                }

            }
        });
    }

    function signup(req, res, next) {
        //TODO: implement signup
    }


    return app;
})();