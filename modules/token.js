var express = require('express');
var rest = require('./rest');
var settings = require('./settings');
var crypto = require('crypto');
var redis = require("./redis");

module.exports = {

    createToken: function (userID, cb) {
        var token = this._tokenHash()
        var tokenHash = "token:" + token;
        var usertokenHash = "user:" + userID + ":token";
        //console.log("creating token:" + tokenHash);
        redis.client.multi([
            ["hmset", tokenHash, {user: userID}],
            ["expire", tokenHash, settings.tokenExpireTime],
            ["set", usertokenHash, token],
            ["expire", usertokenHash, settings.tokenExpireTime]
        ]).execAsync().then(function () {
            cb(token);
        }).error(function (err) {
            console.log("error while creating token for user " + userID);
            console.log(err);
        });
    },

    _tokenHash: function () {
        return crypto.randomBytes(20).toString('hex');
    },

    tokenValid: function (userID, token, cb) {
        var tokenHash = "token:" + token;
        //var usertokenHash = "user:" + userID + ":token";
        redis.client.hgetallAsync(tokenHash).then(function (obj) {
            if (obj && obj.user && obj.user == userID) {
                cb(true);
            } else {
                cb(false);
            }
        }).error(function (err) {
            console.log("ERROR: couldn't validate token " + token + " for user " + userID);
            console.log(err);
            cb(false);
        });
    },

    verifyUT: function (ut, res, cb) {
        if (ut.user && ut.token) {
            this.tokenValid(ut.user, ut.token, function (response) {
                if (!response) {
                    console.log("WARN: auth fail from user: "+ut.user);
                    res.json(settings.authFailedResponse);
                } else {
                    cb();
                }
            });
        }
    }
};