var rest = require('./rest');
var Promise = require('bluebird');
var _ = require('underscore');
var express = require('express');

var slugify = function (name) {
    return name
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '-')
        ;
};

var getAllObjNames = function (objType) {
    return new Promise(function (resolve, reject) {
        rest.client.smembersAsync(objType + "s").then(function (ids) {
            var multi = rest.client.multi();
            ids.forEach(function (id) {
                multi.hmgetAsync([objType + ":" + id.toString(), "id", "name"]);
            });
            multi.execAsync().then(function (replies) {
                var out = [];
                var slugs = [];

                replies.forEach(function (obj, index) {
                    var slug = slugify(obj[1]);
                    var slugClean = true;
                    while (slugs.indexOf(slug) !== -1) {
                        if (slugClean) {
                            slugClean = false;
                            slug += "-1";
                        } else {
                            slug = slug.substr(0, slug.length - 2) + "-" + (parseInt(slug.substr(slug.length - 1)) + 1 + "");
                        }
                    }
                    out.push({
                        type: objType,
                        id: obj[0],
                        name: obj[1],
                        slug: slug
                    });
                });
                resolve(out);
            });
        }).error(function (err) {
            console.log("error while loading all objectnames for " + objType);
            console.log(err);
            reject(err);
        });
    });
};

var tags = [];

var updateObjectTags = function () {
    console.log("DBG: updating tag index");
    return new Promise(function (resolve, reject) {
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