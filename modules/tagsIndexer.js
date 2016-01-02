var rest = require('./rest');
var Promise = require('bluebird');
var _ = require('underscore');

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
                    out[objType + ":" + obj[0]] = obj[1]
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



module.exports = {
    tags: [],
    updateObjectTags: function () {
        console.log("DBG: updating tag index");
        var self = this;
        return new Promise(function(resolve, reject) {
            Promise.join(
                getAllObjNames("event"),
                getAllObjNames("hushtag"),
                getAllObjNames("user"),
                getAllObjNames("location"),
                function (events, hushtags, users, locations) {
                    //console.log("got combined data");
                    //console.dir(events);
                    //console.dir(hushtags);
                    //console.dir(users);
                    //console.dir(locations);
                    _.extend(self.tags, events, hushtags, users, locations);
                    //console.dir(self.tags);
                    resolve(self.tags);
                }
            );
        });
    }

};
