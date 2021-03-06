var Data = require('./datainterface');

module.exports = (function () {
    'use strict';

    return new Data("event",
        function (obj) {
            return {
                name: obj.name,
                pics: JSON.stringify(obj.pics || []),
                flags: JSON.stringify(obj.flags || []),
                tags: JSON.stringify(obj.tags || []),
                description: obj.description,
                start: obj.start,
                end: obj.end || "",
                invite_only: obj.invite_only,
                invitees: JSON.stringify(obj.invitees || []),
                location: obj.location,
                owner: obj.owner
            };
        }, function (obj) {
            obj.pics = JSON.parse(obj.pics);
            obj.flags = JSON.parse(obj.flags);
            obj.tags = JSON.parse(obj.tags);
            obj.invitees = JSON.parse(obj.invitees);
            obj.end = obj.end || null;
            obj.upvotes = obj.upvotes || 0;
            obj.downvotes = obj.downvotes || 0;
            return obj;
        }
    );

})();

