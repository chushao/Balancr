
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/users', user.list);

//nav items
app.get('/', routes.index);
app.get('/workplay', routes.workplay);
app.get('/doughnut', routes.doughnut);
app.get('/statistics', routes.statistics);
app.get('/settings', routes.settings);
app.get('/add', routes.add);

//other items
app.get('/calendar', routes.calendar);
app.get('/details', routes.details);
app.get('/signup', routes.signup);
app.get('/resetpassword', routes.resetpassword);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
