var express = require('express');
var rest = require('./rest');
var token = require('./token');

module.exports = function (name, packer, unpacker) {
    'use strict';
    var app = express.Router();

    app.get('/' + name + 's', getAllData);
    app.get('/' + name + '/:id', getData);
    app.post('/' + name + 's', postData);
    app.put('/' + name + '/:id', putData);
    app.get('/' + name + '/:id/comments', getComments);
    app.post('/' + name + '/:id/comment', postComment);
    app.delete('/' + name + '/:id/comment/:cid', deleteComment);
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
        token.verifyUT(userToken, res, function () {
            console.log("INFO: posting obj: " + name + ":" + obj.name);
            rest.createDetail(name, obj, res, next, unpacker);
        });
    }

    function putData(req, res, next) {
        var id = req.params.id;
        var userToken = req.body.ut;
        var obj = packer(req.body.obj);
        token.verifyUT(userToken, res, function () {
            console.log("INFO: putting obj: " + name + ":" + id);
            rest.updateDetail(name, id, obj, res, next, unpacker);
        });
    }

    function deleteData(req, res, next) {
        var id = req.params.id;
        rest.deleteDetail(name, id, res, next);
    }

    function postComment(req, res, next) {
        var id = req.params.id;
        var userToken = req.body.ut;
        var obj = req.body.obj;
        token.verifyUT(userToken, res, function () {
            console.log("INFO: posting comment for obj: " + name + ":" + id);
            rest.postComment(name, id, obj, res, next);
        });
    }

    function deleteComment(req, res, next) {
        var id = req.params.id;
        var cid = req.params.cid;
        var userToken = req.body.ut;
        token.verifyUT(userToken, res, function () {
            console.log("INFO: deleting comment " + cid + " for obj: " + name + ":" + id);
            rest.deleteComment(name, id, cid, res, next);
        });
    }

    function getComments(req, res, next) {
        var id = req.params.id;
        rest.getComments(name, id, res, next);
    }

    return app;
};