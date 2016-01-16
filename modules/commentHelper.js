var TagsHelper = require("./tagsHelper");

module.exports = {
    packer: function (obj) {
        return {
            content: obj.content,
            flags: JSON.stringify(obj.flags || []),
            created: obj.created,
            owner: obj.owner
        };
    },
    unpacker: function (obj) {
        obj.flags = JSON.parse(obj.flags);
        obj.upvotes = obj.upvotes || 0;
        obj.downvotes = obj.downvotes || 0;
        obj.content = TagsHelper.replaceTags(obj.content);
        return obj;
    }
};
