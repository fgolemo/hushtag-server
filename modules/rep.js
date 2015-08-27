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

    return app;
})();