
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

//facebook authentication
var authids = require('./auth.js');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

var app = express();

//serialize and deserialize (for persistent sessions)
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new FacebookStrategy({
	clientID: authids.facebook.clientID,
	clientSecret: authids.facebook.clientSecret,
	callbackURL: authids.facebook.callbackURL
},
function(accessToken, refreshToken, profile, done) {
	process.nextTick(function () {
		return done(null, profile);
	});
}
));

app.get('/auth/facebook',
	passport.authenticate('facebook'),
	function(req, res){
});

app.get('/auth/facebook/callback',
passport.authenticate('facebook', { failureRedirect: '/' }),
function(req, res) {
	res.redirect('/workplay'); //currently directs to workplay until we have profile screen
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/')
}



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
