var express = require('express');
var app = express();
var redis = require('redis');
var url = require('url');
var redisURL = url.parse(process.env.REDISCLOUD_URL || "redis://user:foobared@127.0.0.1:6379");
var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
var bodyParser = require('body-parser')

client.auth(redisURL.auth.split(":")[1]);

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));


// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function (request, response) {
    response.render('pages/index');
});

app.get('/events', getEvents);
app.get('/event/:id', getEvent);
app.post('/events', postEvent);
app.put('/event/:id', putEvent);
app.delete('/event/:id', deleteEvent);

function getAll(key, res, next) {
    getIDs(key + "s", function (ids) {
        var multiQuery = [];
        ids.forEach(function (id, index) {
            multiQuery.push(["hgetall", key + ":" + id.toString()]);
        });
        client.multi(multiQuery).exec(function (err, replies) {
            if (err) {
                console.log("error during multiquery, key:" + key);
                console.log(err);
            } else {
                var out = [];
                replies.forEach(function (obj, index) {
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
    getDetail("event", id, res, next);
}

function postEvent(req, res, next) {
    var event = {
        name: req.body.name
    };
    createDetail("event", event, res, next);
}

function putEvent(req, res, next) {
    var id = req.params.id;
    var event = {
        name: req.body.name
    };
    updateDetail("event", id, event, res, next);
}

function deleteEvent(req, res, next) {
    var id = req.params.id;
    deleteDetail("event", id, res, next);
}

function createDetail(key, obj, res, next) {
    client.incr(key + "ID", function (err, nextID) {
        if (err) {
            console.log("error while incrementing IDs for " + key);
            console.log(err);
        } else {
            obj.id = nextID;
            var hash = key + ":" + nextID;
            client.multi([
                ["hmset", hash, obj],
                ["sadd", key + "s", nextID]
            ]).exec(function (err) {
                    if (err) {
                        console.log("error while inserting data for " + hash);
                        console.dir(obj);
                        console.log(err);
                    } else {
                        res.json({status: "success", obj: obj});
                    }
                }
            );
        }
    });
}

function updateDetail(key, id, obj, res, next) {
    obj.id = id;
    var hash = key + ":" + id;
    client.hmset(hash, obj, function (err) {
        if (err) {
            console.log("error while updating data for " + hash);
            console.dir(obj);
            console.log(err);
        } else {
            res.json({status: "success", obj: obj});
        }
    });
}

function deleteDetail(key, id, res, next) {
    client.srem(key + "s", id, function (err) {
        if (err) {
            console.log("error while deleting id " + id + " for " + key);
            console.log(err);
        } else {
            res.json({status: "success", id: id});
        }
    });
}

function getIDs(key, cb) {
    client.smembers(key, function (err, obj) {
        if (err) {
            console.log("error while looking for set members of " + key);
            console.log(err);
        } else {
            cb(obj);
        }
    });
}

function getDetail(key, id, res, next) {
    var hash = key + ":" + id;
    client.hgetall(hash, function (err, obj) {
        if (err) {
            console.log("error while looking for hash:" + hash);
            console.log(err);
        } else {
            res.json(obj);
        }
    });
}

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});


