var express = require('express');
var rest = require('./rest');
var token = require('./token');
var settings = require('./settings');
var rep = require('./rep');

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

    function _getVotersHash(obj) {
        return _getObjHash(obj)+":voters";
    }

    function _getObjHash(obj) {
        return obj.type+':'+obj.id;
    }

    function _hasVoted(userToken, obj, res, cb, cbErr) {
        token.verifyUT(userToken, res, function() {
            var hash = _getVotersHash(obj);
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

    function vote(updown, req, res, next) {
        var userToken = req.body.ut;
        var obj = req.body.obj;
        _hasVoted(userToken, obj, res, function(response) {
            if (response) {
                res.json({status: "fail", msg: "You already voted."});
            } else {
                var hashObj = _getObjHash(obj);
                var hashVoters = _getVotersHash(obj);
                rest.client.multi([
                    ["hincrby", hashObj, updown+"votes", 1],
                    ["sadd", hashVoters, userToken.user],
                    ["hget", hashObj, "owner"]
                ]).execAsync().then(function(response) {
                    var owner = response[2];
                    rep.helper.repChange((updown=="up"?"incr":"decr") ,owner, obj.type, function(result) {
                        if (!result) {
                            console.log("ERROR: while increasing rep");
                        }
                        console.log("INFO: "+updown+"voted "+hashObj+" by user "+userToken.user);
                        res.json({status: "success", msg: ""});
                    });
                }).error(function (err) {
                    console.log("ERROR: while "+updown+"voting from user " + userToken.user + " on obj:");
                    console.dir(obj);
                    console.log(err);
                    res.json(settings.serverError);
                });
            }
        }, function(err) {
            res.json(settings.serverError);
        });
    }

    function upvote(req, res, next) {
        return vote("up", req, res, next);
    }

    function downvote(req, res, next) {
        return vote("down", req, res, next);
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