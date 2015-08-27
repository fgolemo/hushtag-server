var express = require('express');
var rest = require('./rest');
var settings = require('./settings');
var crypto = require('crypto');

module.exports = {

    createToken: function (userID, cb) {
        var token = this._tokenHash()
        var tokenHash = "token:" + token;
        var usertokenHash = "user:" + userID + ":token";
        console.log("creating token:" + tokenHash);
        rest.client.multi([
            ["hmset", tokenHash, {user: userID}],
            ["expire", tokenHash, settings.tokenExpireTime],
            ["set", usertokenHash, token],
            ["expire", usertokenHash, settings.tokenExpireTime]
        ]).execAsync().then(function() {
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
        rest.client.hgetallAsync(tokenHash).then(function(obj) {
            if (obj && obj.user && obj.user == userID) {
                cb(true);
            } else {
                cb(false);
            }
        }).error(function(err) {
            console.log("ERROR: couldn't validate token "+token+" for user "+userID);
            console.log(err);
            cb(false);
        });
    }
};