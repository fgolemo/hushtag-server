var express = require('express');
var app = express();
var redis = require('redis');
var url = require('url');
var crypto = require('crypto');
var redisURL = url.parse(process.env.REDISCLOUD_URL || "redis://user:foobared@127.0.0.1:6379");
var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
var bodyParser = require('body-parser')

client.auth(redisURL.auth.split(":")[1]);

app.set('port', (process.env.PORT || 5000));

app.use('/static', express.static(__dirname + '/public'));
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.use(function(req, res, next) { // allow cors
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function (request, response) {
    response.render('pages/index');
});



//====================== EVENT

app.get('/events', getEvents);
app.get('/event/:id', getEvent);
app.post('/events', postEvent);
app.put('/event/:id', putEvent);
app.delete('/event/:id', deleteEvent);

function packEvent(obj) {
    var out = {
        name: obj.name,
        pics: JSON.stringify(obj.pics || []),
        comments: JSON.stringify(obj.comments || []),
        flags: JSON.stringify(obj.flags || []),
        tags: JSON.stringify(obj.tags || []),
        description: obj.description,
        start: obj.start,
        end: obj.end,
        invite_only: obj.invite_only,
        invitees: JSON.stringify(obj.invitees || []),
        location: obj.location,
        organizer: obj.organizer
    };
    return out;
}

function unpackEvent(obj) {
    obj.pics = JSON.parse(obj.pics);
    obj.flags = JSON.parse(obj.flags);
    obj.tags = JSON.parse(obj.tags);
    obj.comments = JSON.parse(obj.comments);
    obj.invitees = JSON.parse(obj.invitees);
    return obj;
}

function getEvents(req, res, next) {
    getAll("event", res, next, unpackEvent);
}

function getEvent(req, res, next) {
    var id = req.params.id;
    getDetail("event", id, res, next, unpackEvent);
}

function postEvent(req, res, next) {
    var obj = packEvent(req.body);
    createDetail("event", obj, res, next, unpackEvent);
}

function putEvent(req, res, next) {
    var id = req.params.id;
    var obj = packEvent(req.body);;
    updateDetail("event", id, obj, res, next, unpackEvent);
}

function deleteEvent(req, res, next) {
    var id = req.params.id;
    deleteDetail("event", id, res, next);
}



//====================== HUSHTAG

app.get('/hushtags', getHushtags);
app.get('/hushtag/:id', getHushtag);
app.post('/hushtags', postHushtag);
app.put('/hushtag/:id', putHushtag);
app.delete('/hushtag/:id', deleteHushtag);

function packHushtag(obj) {
    var out = {
        name: obj.name,
        pics: JSON.stringify(obj.pics || []),
        comments: JSON.stringify(obj.comments || []),
        flags: JSON.stringify(obj.flags || []),
        tags: JSON.stringify(obj.tags || []),
        uses: JSON.stringify(obj.family || []),
        forms: obj.forms,
        synonyms: obj.synonyms,
        description: obj.description,
        safety: obj.safety,
        legality: obj.legality,
        dosages: obj.dosages,
        family: JSON.stringify(obj.family || [])
    };
    return out;
}

function unpackHushtag(obj) {
    obj.pics = JSON.parse(obj.pics);
    obj.flags = JSON.parse(obj.flags);
    obj.tags = JSON.parse(obj.tags);
    obj.comments = JSON.parse(obj.comments);
    obj.family = JSON.parse(obj.family);
    obj.uses = JSON.parse(obj.uses);
    return obj;
}

function getHushtags(req, res, next) {
    getAll("hushtag", res, next, unpackHushtag);
}

function getHushtag(req, res, next) {
    var id = req.params.id;
    getDetail("hushtag", id, res, next, unpackHushtag);
}

function postHushtag(req, res, next) {
    var obj = packHushtag(req.body);
    createDetail("hushtag", obj, res, next, unpackHushtag);
}

function putHushtag(req, res, next) {
    var id = req.params.id;
    var obj = packHushtag(req.body);
    updateDetail("hushtag", id, obj, res, next, unpackHushtag);
}

function deleteHushtag(req, res, next) {
    var id = req.params.id;
    deleteDetail("hushtag", id, res, next);
}



//====================== LOCATION

app.get('/locations', getLocations);
app.get('/location/:id', getLocation);
app.post('/locations', postLocation);
app.put('/location/:id', putLocation);
app.delete('/location/:id', deleteLocation);

function packLocation(obj) {
    var out = {
        name: obj.name,
    };
    return out;
}

function unpackLocation(obj) {
    return obj;
}

function getLocations(req, res, next) {
    getAll("location", res, next, unpackLocation);
}

function getLocation(req, res, next) {
    var id = req.params.id;
    getDetail("location", id, res, next, unpackLocation);
}

function postLocation(req, res, next) {
    var obj = packLocation(req.body);
    createDetail("location", obj, res, next, unpackLocation);
}

function putLocation(req, res, next) {
    var id = req.params.id;
    var obj = packLocation(req.body);
    updateDetail("location", id, obj, res, next, unpackLocation);
}

function deleteLocation(req, res, next) {
    var id = req.params.id;
    deleteDetail("location", id, res, next);
}




//====================== USER

app.get('/user/:id', getUser);

function unpackUser(obj) {
    obj.password_hash = "";
    delete obj.lastloggedin;
    delete obj.created;
    obj.contact = "";
    return obj;
}

function unpackUserPrivileged(obj) { // only called when user = self
    obj.password_hash = "";
    return obj;
}

function getUser(req, res, next) {
    var id = req.params.id;
    getDetail("user", id, res, next, unpackUser);
}




//====================== LOGIN

app.post('/login', login);
app.post('/signup', signup);


function login(req, res, next) {
    console.log("trying to log in");
    var name = req.body.name;
    var hash = req.body.hash;
    client.zscore(["userids", name], function (err, obj) {
        if (err) {
            console.log("error while looking up score for user:" + name);
            console.log(err);
        } else {
            console.log("found username");
            getDetail("user", obj, res, next, function(userData) {
                console.log("hash:");
                console.log(hash);
                console.log("server:");
                console.log(userData.password_hash);

                if (userData.password_hash == hash) {

                    return {status: "success", obj: unpackUserPrivileged(userData)};
                } else {
                    return {status: "fail", msg: "wrong pass"};
                }
            });
        }
    });
}

function signup(req, res, next) {
    //TODO: implement signup
}






//====================== SHARED

function getAll(key, res, next, unpacker) {
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
                    out.push(unpacker(obj));
                });
                res.json(out);
            }
        });
    });
}

function createDetail(key, obj, res, next, unpacker) {
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
                        res.json({status: "success", obj: unpacker(obj)});
                    }
                }
            );
        }
    });
}

function updateDetail(key, id, obj, res, next, unpacker) {
    obj.id = id;
    var hash = key + ":" + id;
    client.hmset(hash, obj, function (err) {
        if (err) {
            console.log("error while updating data for " + hash);
            console.dir(obj);
            console.log(err);
        } else {
            res.json({status: "success", obj: unpacker(obj)});
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

function getDetail(key, id, res, next, unpacker) {
    var hash = key + ":" + id;
    client.hgetall(hash, function (err, obj) {
        if (err) {
            console.log("error while looking for hash:" + hash);
            console.log(err);
        } else {
            res.json(unpacker(obj));
        }
    });
}

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});


