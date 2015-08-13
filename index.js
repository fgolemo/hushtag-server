var express = require('express');
var app = express();
var redis = require('redis');
var url = require('url');
var redisURL = url.parse(process.env.REDISCLOUD_URL || "redis://user:foobared@127.0.0.1:6379");
var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
client.auth(redisURL.auth.split(":")[1]);

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function (request, response) {
    response.render('pages/index');
});

app.get('/keys/:pattern?', getKeys);
app.get('/key/:key', getKeyDetails);

app.get('/events', getEvents);
app.get('/event/:id', getEvent);

function getKeys(req, res, next) {
    var pattern = req.params.pattern || "*";
    console.log('getting keys matching pattern ' + pattern);
    client.keys(pattern, function (err, keys) {
        res.json(keys);
    });
}

function getKeyDetails(req, res, next) {
    var key = req.params.key;
    console.log('getting value of key ' + key);
    client.get(key, function (err, value) {
        res.json(value);
    });
}

function getAll(key, res, next) {
    getIDs(key+"s", function (ids) {
        var multiQuery = [];
        //console.log("got IDs:");
        //console.log(ids);
        ids.forEach(function (id, index) {
            //console.log("looking up hash " + key + ":" + id.toString());
            //console.log("Reply " + index + ": " + reply.toString());
            multiQuery.push(["hgetall", key+":"+id.toString()]);
        });
        //console.log("done with the lookup, sending results");
        //console.log(multiQuery);
        client.multi(multiQuery).exec(function (err, replies) {
            //console.log("executed multiquery:");
            if (err) {
                //console.log("err:");
                console.log("got an error during multiquery, key:"+key);
                console.log(err);
            } else {
                //console.log("results:");
                out = [];
                replies.forEach(function(obj, index) {
                    out.push(obj);
                });
                res.json(out);
            }
        });
    });
}

function getEvents(req, res, next) {
    var key = "event";
    getAll(key, res, next);
}

function getEvent(req, res, next) {
    var id = req.params.id;
    getDetail("event", id, function(result) {
        res.json(result);
    });
}

function getIDs(key, cb) {
    client.smembers(key, function (err, obj) {
        if (err) {
            console.log(err);
        } else {
            cb(obj);
        }
    });
}

function getDetail(key, id, cb) {
    var hash = key+":"+id;
    console.log("looking for "+hash);
    client.hgetall(hash, function (err, obj) {
        if (err) {
            console.log(err);
        } else {
            cb(obj);
        }
    });
}

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
    client.set('foo', 'bar');
    client.get('foo', function (err, reply) {
        console.log(reply.toString()); // Will print `bar`
    });
});


