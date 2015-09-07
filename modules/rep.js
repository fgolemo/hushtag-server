var express = require('express');
var rest = require('./rest');

module.exports = (function () {
    'use strict';
    var app = express.Router();

    app.get('/user/:id/rep', getUserRep);

    function getUserRep(req, res, next) {
        var id = req.params.id;
        _getUserRep(id, function (obj) {
            res.json({status: "success", obj: obj});
        });
    }

    function _getUserRep(id, cb) {
        var hash = "user:" + id + ":rep:";
        rest.client.multi([
            ["get", hash + "events"],
            ["get", hash + "hushtags"],
            ["get", hash + "locations"]
        ]).execAsync().then(cb).error(function (err) {
            console.log("error while getting rep for user " + id);
            console.log(err);
        });
    }

    var helper = {};

    helper.repChange = function(incrDecr, id, type, cb) {
        var newType = "";
        if (type == "event" || type == "hushtag" || type == "location") {
            newType = type + "s";
        } else if (type == "hushtagUse") {
            newType = "hushtags";
        } else {
            console.log("ERROR: incorrect type for rep increase:"+type);
            cb(false);
        }
        var hash = "user:" + id + ":rep:" + newType;
        var operation = (incrDecr=="incr"?"incr":"decr") + "Async";
        rest.client[operation](hash).then(function () {
            cb(true)
        }).error(function (err) {
            console.log("ERROR: increasing rep for user " + id + " on " + type);
            console.log(err);
            cb(false);
        });
    };

    return {
        router: app,
        helper: helper
    };
})();