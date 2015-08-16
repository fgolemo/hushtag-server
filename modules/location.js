var Data = require('./datainterface');

module.exports = (function () {
    'use strict';

    return new Data("location", function (obj) {
            return {
                name: obj.name
            };
        }, function (obj) {
            return obj;
        }
    );

})();