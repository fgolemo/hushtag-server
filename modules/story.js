var Data = require('./datainterface');

module.exports = (function () {
    'use strict';

    return new Data("story",
        function (obj) {
            return {
                pics: JSON.stringify(obj.pics || []),
                comments: JSON.stringify(obj.comments || []),
                flags: JSON.stringify(obj.flags || []),
                tags: JSON.stringify(obj.tags || []),
                datetime: obj.datetime,
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
            obj.comments = JSON.parse(obj.comments);
            return obj;
        }
    );

})();

