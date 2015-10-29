var Data = require('./datainterface');
var commentHelper = require('./commentHelper');

module.exports = (function () {
    'use strict';
    return new Data("comment", commentHelper.packer, commentHelper.unpacker);
})();

