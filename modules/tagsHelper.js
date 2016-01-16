var Tags = require("./tagsIndexer");

var replaceTags = function(inputText) {
    var pieces = inputText.split(" ");
    for (var i in pieces) {
        if(pieces[i].indexOf("#") !== 0) {
            continue;
        }
        var found = Tags.container.t.filter(function(tag) {
            return tag.slug == pieces[i].substr(1);
        });
        if (found.length>0) {
            //pieces[i] = '<a href="#/tags/'+found[0].type+'/'+found[0].id+'">'+pieces[i]+'</a>';
            //TODO: reactivate as soon as the client can handle the tags, because right now the link gets escaped
        }
    }
    return pieces.join(" ");
};

module.exports = {
    replaceTags: replaceTags
};