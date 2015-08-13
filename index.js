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

app.get('/events', getEvents);
app.get('/event/:id', getEvent);

function getAll(key, res, next) {
    getIDs(key+"s", function (ids) {
        var multiQuery = [];
        ids.forEach(function (id, index) {
            multiQuery.push(["hgetall", key+":"+id.toString()]);
        });
        client.multi(multiQuery).exec(function (err, replies) {
            if (err) {
                console.log("error during multiquery, key:"+key);
                console.log(err);
            } else {
                var out = [];
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
            console.log("error while looking for set members of "+key);
            console.log(err);
        } else {
            cb(obj);
        }
    });
}

function getDetail(key, id, cb) {
    var hash = key+":"+id;
    client.hgetall(hash, function (err, obj) {
        if (err) {
            console.log("error while looking for hash:"+hash);
            console.log(err);
        } else {
            cb(obj);
        }
    });
}

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});


