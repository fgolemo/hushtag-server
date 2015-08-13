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

function getKeys(req, res, next) {
    var pattern = req.params.pattern || "*";
    console.log('getting keys matching pattern ' + pattern);
    client.keys(pattern, function(err, keys) {
        res.json(keys);
    });
}

function getKeyDetails(req, res, next) {
    var key = req.params.key;
    console.log('getting value of key ' + key);
    client.get(key, function(err, value) {
        res.json(value);
    });
}


app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
    client.set('foo', 'bar');
    client.get('foo', function (err, reply) {
        console.log(reply.toString()); // Will print `bar`
    });
});


