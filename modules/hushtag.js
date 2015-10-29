var Data = require('./datainterface');

module.exports = (function () {
    'use strict';

    return new Data("hushtag",
        function (obj) {
            return {
                name: obj.name,
                pics: JSON.stringify(obj.pics || []),
                flags: JSON.stringify(obj.flags || []),
                tags: JSON.stringify(obj.tags || []),
                stories: JSON.stringify(obj.stories || []),
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
            obj.family = JSON.parse(obj.family);
            obj.stories = JSON.parse(obj.stories);
            obj.synonyms = JSON.parse(obj.synonyms);
            return obj;
        }
    );

})();

