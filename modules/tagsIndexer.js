var rest = require('./rest');
var Promise = require('bluebird');
var _ = require('underscore');
var express = require('express');

var getAllObjNames = function (objType) {
    return new Promise(function(resolve, reject) {
        rest.client.smembersAsync(objType + "s").then(function (ids) {
            var multi = rest.client.multi();
            ids.forEach(function (id) {
                multi.hmgetAsync([objType + ":" + id.toString(), "id", "name"]);
            });
            multi.execAsync().then(function (replies) {
                var out = [];
                replies.forEach(function (obj, index) {
                    //out[objType + ":" + obj[0]] = obj[1]
                    out.push({
                        type: objType,
                        id: obj[0],
                        name: obj[1]
                    });
                });
                resolve(out);
            });
        }).error(function (err) {
            console.log("error while loading all objectnames for "+objType);
            console.log(err);
            reject(err);
        });
    });
};

var tags = [];

var updateObjectTags = function () {
    console.log("DBG: updating tag index");
    return new Promise(function(resolve, reject) {
        Promise.join(
            getAllObjNames("event"),
            getAllObjNames("hushtag"),
            getAllObjNames("user"),
            getAllObjNames("location"),
            function (events, hushtags, users, locations) {
                tags = [];
                tags = tags.concat(events, hushtags, users, locations);
                resolve(tags);
            }
        );
    });
};

var getTags = function (req, res, next) {
    res.json({status: "success", tags: tags});
};

var app = express.Router();
app.get('/tags', getTags);


module.exports = {
    tags: tags,
    updateObjectTags: updateObjectTags,
    handler: app
};

updateObjectTags();