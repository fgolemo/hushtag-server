var Data = require('./datainterface');

module.exports = (function () {
    'use strict';

    return new Data("hushtag",
        function (obj) {
            return {
                name: obj.name,
                pics: JSON.stringify(obj.pics || []),
                comments: JSON.stringify(obj.comments || []),
                flags: JSON.stringify(obj.flags || []),
                tags: JSON.stringify(obj.tags || []),
                uses: JSON.stringify(obj.uses || []),
                forms: obj.forms,
                synonyms: JSON.stringify(obj.synonyms || []),
                description: obj.description,
                safety: obj.safety,
                legality: obj.legality,
                dosages: obj.dosages,
                family: JSON.stringify(obj.family || [])
            };
        }, function (obj) {
            obj.pics = JSON.parse(obj.pics);
            obj.flags = JSON.parse(obj.flags);
            obj.tags = JSON.parse(obj.tags);
            obj.comments = JSON.parse(obj.comments);
            obj.family = JSON.parse(obj.family);
            obj.uses = JSON.parse(obj.uses);
            obj.synonyms = JSON.parse(obj.synonyms);
            return obj;
        }
    );

})();

