var Data = require('./datainterface');

module.exports = (function () {
    'use strict';

    return new Data("story",
        function (obj) {
            return {
                pics: JSON.stringify(obj.pics || []),
                flags: JSON.stringify(obj.flags || []),
                tags: JSON.stringify(obj.tags || []),
                owner: obj.owner,
                created: obj.datetime,
                hushtag: obj.hushtag,
                dosage: obj.dosage,
                effect_positive: obj.effect_positive,
                effect_negative: obj.effect_negative,
                effect_duration: obj.effect_duration,
                event: obj.event
            };
        }, function (obj) {
            obj.pics = JSON.parse(obj.pics);
            obj.flags = JSON.parse(obj.flags);
            obj.tags = JSON.parse(obj.tags);
            obj.upvotes = obj.upvotes || 0;
            obj.downvotes = obj.downvotes || 0;
            return obj;
        }
    );

})();

