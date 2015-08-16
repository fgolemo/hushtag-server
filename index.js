var express = require('express');
var app = express();
var crypto = require('crypto');
var bodyParser = require('body-parser');
var handlerHushtag = require('./modules/hushtag');
var handlerEvent = require('./modules/event');
var handlerLocation = require('./modules/location');
var handlerUser = require('./modules/user');


app.set('port', (process.env.PORT || 5000));

app.use('/static', express.static(__dirname + '/public'));
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.use(function (req, res, next) { // allow cors
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

app.use('/', handlerHushtag);
app.use('/', handlerEvent);
app.use('/', handlerLocation);
app.use('/', handlerUser);

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});


