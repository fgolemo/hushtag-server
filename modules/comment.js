var Data = require('./datainterface');

module.exports = (function () {
    'use strict';

    return new Data("comment",
        function (obj) {
            return {
                content: obj.content,
                flags: JSON.stringify(obj.flags || []),
                created: obj.created,
                owner: obj.owner
            };
        }, function (obj) {
            obj.flags = JSON.parse(obj.flags);
            return obj;
        }
    );

})();

