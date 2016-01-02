var rest = require('./rest');
var Promise = require('bluebird');

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
    updateObjectTags: function () {
        console.log("DBG: updating tag index");
        // get all users, events, hushtags, locations
        // store their name, type & ID
        var objectTags = [];

        //getAllObjNames("event").then(function(data) {
        //    console.log("DBG: got actual data in mother fun:");
        //    console.dir(data);
        //});
        //getAllObjNames("hushtag").then(function(data) {
        //    console.log("DBG: got actual data in mother fun:");
        //    console.dir(data);
        //});
        //

        Promise.join(
            getAllObjNames("event"),
            getAllObjNames("hushtag"),
            function (events, hushtags) {
                console.log("got combined data");
                console.dir(events);
                console.dir(hushtags);
            }
        );

        return {};
    }

};
