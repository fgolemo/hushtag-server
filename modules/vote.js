var express = require('express');
var rest = require('./rest');
var token = require('./token');
var settings = require('./settings');

module.exports = (function () {
    'use strict';
    var app = express.Router();

    app.post('/votes/hasVoted', hasVoted);
    app.post('/votes/upvote', upvote);
    app.post('/votes/downvote', downvote);

    function hasVoted(req, res, next) {
        var userToken = req.body.ut;
        var obj = req.body.obj;

        _hasVoted(userToken, obj, res, function(response) {
            res.json({status: "success", reply: response});
        }, function(err) {
            res.json({status: "fail", msg: "Currently can't process this request. "+settings.errorPersistsMsg});
        });
    }

    function _hasVoted(userToken, obj, res, cb, cbErr) {
        token.verifyUT(userToken, res, function() {
            //console.log("INFO: posting obj: "+name+":"+id);
            var hash = obj.type+':'+obj.id+":voters";
            rest.client.sismemberAsync([hash, userToken.user]).then(function(response) {
                cb(response);
            }).error(function (err) {
                console.log("ERROR: couldn't determine if user "+userToken.user+" has voted for "+obj.type+" "+obj.id);
                if (cbErr) {
                    cbErr(err);
                }
            });
        });
    }

    function upvote(req, res, next) {
        console.log("incomming upvote");
        var userToken = req.body.ut;
        var obj = req.body.obj;
        _hasVoted(userToken, obj, res, function(response) {
            console.log("upvoting, hv response");
            console.dir(response);
            res.json({});
        }, function(err) {

        });
    }

    function downvote(req, res, next) {
        console.log("incomming downvote");
        var userToken = req.body.ut;
        var obj = req.body.obj;
        _hasVoted(userToken, obj, res, function(response) {
            console.log("downvoting, hv response");
            console.dir(response);
            res.json({});
        }, function(err) {

        });
    }

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