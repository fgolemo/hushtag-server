var express = require('express');
var rest = require('./rest');

module.exports = (function() {
    'use strict';
    var app = express.Router();

    app.get('/user/:id/rep', getUserRep);

    function getUserRep(req, res, next) {
        var id = req.params.id;
        var hash = "user:"+id+":rep:";
        rest.client.multi([
            ["get", hash+"events"],
            ["get", hash+"hushtags"],
            ["get", hash+"locations"]
        ]).exec(function (err, obj) {
                if (err) {
                    console.log("error while getting rep for user " + id);
                    console.log(err);
                    console.dir(obj);
                } else {
                    res.json({status: "success", obj: obj});
                }
            }
        );
    }

    return app;
})();