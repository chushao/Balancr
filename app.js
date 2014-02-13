
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var login = require('./routes/login');
var flash = require('connect-flash');
var util = require('util');

//facebook authentication
var authids = require('./auth.js');
var userlist = require('./users.js');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var LocalStrategy = require('passport-local').Strategy;

//pw hashing
var hash = require('./hash');



function findById(id, fn) {
	var index = id - 1;
	if(userlist[index]) {
		fn(null, userlist[index]);
	}
	else {
		fn(new Error('User ' + id + ' does not exist.'));
	}
}


function findByUsername(username, fn) {
	console.log('findByUsername');
	for(var i = 0, len = userlist.length; i < len; i++) {
		var currUser = userlist[i];
		console.log(currUser);
		if(currUser.username === username) {
			console.log('match found!');
			return fn(null, currUser);
		}
	}
	return fn(null, null);
}

function findByEmail(username, fn) {
	console.log('findByUsername');
	for(var i = 0, len = userlist.length; i < len; i++) {
		var currUser = userlist[i];
		console.log(currUser);
		if(currUser.email === username) {
			console.log('match found!');
			return fn(null, currUser);
		}
	}
	return fn(null, null);
}

//serialize and deserialize (for persistent sessions)
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  findById(id, function (err, user) {
    done(err, user);
  });
});

//local login
passport.use(new LocalStrategy( {usernameField: 'email', passwordField: 'password'},
  function (username, password, done) {
    process.nextTick(function () {
      findByEmail(username, function (err, user) {
        if (err) { return done(err); };
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); };

        hash(password, user.salt, function (err, hash){
        	if (err) {return done(err);}
        	if (hash == user.hash) {
        		return done( null,user );
        	}
        	done(null, false, { message: 'Invalid password' });
        });
      })
    });
  }
));


//Facebook login
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



var app = express();

//Database set up
var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOHQ_URL || 'mongodb://localhost/balancr');


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({ secret: '08D8AF524EC4850DAE5B66ECD9E57' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


//correctly routes to facebook for login
app.get('/auth/facebook',
	passport.authenticate('facebook'),
	function(req, res){
});

//doesn't currently work
app.get('/auth/facebook/callback',
	passport.authenticate('facebook', { failureRedirect: '/' }),
	function (req, res) {
		res.redirect('/workplay'); //currently directs to workplay until we have profile screen
	});


//dunno if this works
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/')
}

//Database schema models
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var Goal = new Schema( {
	name : { type: String }
  , description : { type: String }
  , Date : Date
})

var Activity = new Schema( {
	Activity : { type: String }
  , Category : { type: String }
  , TimeSpent : Number
  , Minutes :  Boolean
  , Work : Boolean
  , Date : Date
});

var User = new Schema( {
	id: Number
  , email: { type: String, default: '' }
  , hashed_pass: { type: String, default: ''}
  , salt: { type: String, defualt: ''}
  , username: { type: String, default: '' }
  , goals: [Goal] //Goal is empty, need to do a .array.push() for goals
  , activities: [Activity] //Array of multiple Activity object
  , categories: [] //Just a list of categories that has been used for activities of this user
});

var User = mongoose.model('User', User);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


//app.get('/users', user.list);

//nav items
app.get('/', routes.index);
app.get('/workplay', routes.workplay);
app.get('/doughnut', routes.doughnut);
app.get('/statistics', routes.statistics);
app.get('/settings', routes.settings);
app.get('/add', routes.add);

//other items
app.get('/calendar', ensureAuthenticated, routes.calendar);
app.get('/details', routes.details);
app.get('/signup', routes.signup);
app.get('/resetpassword', routes.resetpassword);

//Unused for now
//app.get('/login', login.view);

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

//local submission of email and password
app.post('/login',
	passport.authenticate('local', {failureRedirect: '/'}),
	function (req, res) {
		res.redirect('/workplay');
	}
);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
