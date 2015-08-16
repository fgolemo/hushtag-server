var Data = require('./datainterface');

module.exports = (function () {
    'use strict';

    return new Data("event",
        function (obj) {
            return {
                name: obj.name,
                pics: JSON.stringify(obj.pics || []),
                comments: JSON.stringify(obj.comments || []),
                flags: JSON.stringify(obj.flags || []),
                tags: JSON.stringify(obj.tags || []),
                description: obj.description,
                start: obj.start,
                end: obj.end,
                invite_only: obj.invite_only,
                invitees: JSON.stringify(obj.invitees || []),
                location: obj.location,
                organizer: obj.organizer
            };
        }, function (obj) {
            obj.pics = JSON.parse(obj.pics);
            obj.flags = JSON.parse(obj.flags);
            obj.tags = JSON.parse(obj.tags);
            obj.comments = JSON.parse(obj.comments);
            obj.invitees = JSON.parse(obj.invitees);
            return obj;
        }
    );

})();

