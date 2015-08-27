var express = require('express');
var rest = require('./rest');
var token = require('./token');

module.exports = (function () {
    'use strict';
    var app = express.Router();

    app.get('/test/createtoken', tokenTest);
    app.get('/test/validatetoken/:user/:token', tokenValidate);

    function tokenTest(req, res, next) {
        token.createToken("5", function(token) {
            res.json(token);
        });
    }

    function tokenValidate(req, res, next) {
        var user = req.params.user;
        var tokenString = req.params.token;
        token.tokenValid(user, tokenString, function(response) {
            res.json(response);
        });
    }

    return app;
})();