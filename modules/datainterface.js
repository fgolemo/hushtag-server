var express = require('express');
var rest = require('./rest');

module.exports = function(name, packer, unpacker) {
    'use strict';
    var app = express.Router();

    app.get('/'+name+'s', getAllData);
    app.get('/'+name+'/:id', getData);
    app.post('/'+name+'s', postData);
    app.put('/'+name+'/:id', putData);
    app.delete('/'+name+'/:id', deleteData);

    function getAllData(req, res, next) {
        rest.getAll(name, res, next, unpacker);
    }

    function getData(req, res, next) {
        var id = req.params.id;
        rest.getDetail(name, id, res, next, unpacker);
    }

    function postData(req, res, next) {
        var obj = packer(req.body);
        rest.createDetail(name, obj, res, next, unpacker);
    }

    function putData(req, res, next) {
        var id = req.params.id;
        var obj = packer(req.body);
        rest.updateDetail(name, id, obj, res, next, unpacker);
    }

    function deleteData(req, res, next) {
        var id = req.params.id;
        rest.deleteDetail(name, id, res, next);
    }

    return app;
};