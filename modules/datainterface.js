var express = require('express');
var rest = require('./rest');
var token = require('./token');

module.exports = function(name, packer, unpacker) {
    'use strict';
    var app = express.Router();

    app.get('/'+name+'s', getAllData);
    app.get('/'+name+'/:id', getData);
    app.post('/'+name+'s', postData);
    app.put('/'+name+'/:id', putData);
    //app.delete('/'+name+'/:id', deleteData);

    function getAllData(req, res, next) {
        rest.getAll(name, res, next, unpacker);
    }

    function getData(req, res, next) {
        var id = req.params.id;
        rest.getDetail(name, id, res, next, unpacker);
    }

    function postData(req, res, next) {
        var userToken = req.body.ut;
        var obj = packer(req.body.obj);
        token.verifyUT(userToken, res, function() {
            console.log("INFO: posting obj: "+name+":"+id);
            rest.createDetail(name, obj, res, next, unpacker);
        });
    }

    function putData(req, res, next) {
        var id = req.params.id;
        var userToken = req.body.ut;
        var obj = packer(req.body.obj);
        token.verifyUT(userToken, res, function() {
            console.log("INFO: putting obj: "+name+":"+id);
            rest.updateDetail(name, id, obj, res, next, unpacker);
        });
    }

    function deleteData(req, res, next) {
        var id = req.params.id;
        rest.deleteDetail(name, id, res, next);
    }

    return app;
};