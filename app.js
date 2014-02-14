
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
 var User = require('./models/user');
//Database set up
var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOHQ_URL || 'mongodb://localhost/balancr');
var User = mongoose.model('User');
User.remove().exec();
//Seed the database

var chu_data = {
	"id" : 0,
	"email" : "c@shao.com",
	"salt" : "wkSF3tUfzpj5y9PqPVnIgFkxtWmQkRCaIA8blsik6XbYgb0RAeExujSOiF0San7eGjAEJB0iESQf5s8f4kIzkp4GA7UUBQDUDgASKM5NCT9y2dsONE05QSZr1TXHTfjeynfOltUqGXw5OAu2Ko1Rj/Rtd3T1/vUR0WR2lRxrJRU=", 
	"hash" : "��X$&G��]�g��9��\u0017A�>W��?��V�a#\t�O�{�3 0a�\u0012h�\u0000��|�}��|\u0017��\u001bT0��\u0018��\u0006\u00125_c��aT���&9��\u000e[L.%z�j{�\u0003�8 �J\u00193/.\u000b7�n�\u0011[�\u0013\f\u000b�\u0004͹���NyA1����e�",
	"username" : "chu",
	"goals" : {},
	"activties" : [],
	"categories" : ["Job", "Exercise", "Fun", "Family"]
};

var chu = new User(chu_data);
chu.save( function(error, data) {
	if(error) {
		console.log(error);
	} else {
		//console.log(data);
		User.findOne({ username: 'chu' }, function(error, user){
			if(error){
				console.log(error);
			}
			else if(user == null){
				console.log('no such user!')
			}
			else{
				user.activities.push({
					"activity" : "Running around",
					"category" : "Exercise",
					"timeSpent" : 43,
					"minutes" : true,
					"work" : false,
					"date" : "2014-01-05"
				});
				user.save( function(error, data){
					if(error){
						console.log(error);
					} else{
						//console.log(data);
						user.activities.push({
							"activity" : "Walking",
							"category" : "Exercise",
							"timeSpent" : 43,
							"minutes" : false,
							"work" : false,
							"date" : "2014-01-05"
						});
						user.save( function(error, data){
							if(error){
								console.log(error);
							} else {
								//console.log(data);
								user.activities.push({
									"activity" : "Coding",
									"category" : "Job",
									"timeSpent" : 18,
									"minutes" : false,
									"work" : true,
									"date" : "2014-01-06"
								});
								user.save( function(error, data) {
									if (error) {
										console.log(error);
									} else {
										//console.log(data);
									}
								});
							}
						});
					}
				}); 
			}
		});
}
});

/**
mongoose.Model.seed = function(entities) {  
    var promise = new mongoose.Promise;
    this.create(entities, function(err) {
        if(err) { promise.reject(err); }
        else    { promise.resolve(); }
    });
    return promise;
};



User.seed(require('./database.json')); **/
//facebook authentication
var authids = require('./auth.js');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var LocalStrategy = require('passport-local').Strategy;




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
	User.findOne( { id: id }, function (err, user) {
		done(err, user);
	});
});

//local login

passport.use(new LocalStrategy ({
	usernameField: 'email',
	passwordField: 'password'
},
function(email, password, done) {
	User.isValidUserPassword(email, password, done);
}));
/**
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
  )); ) **/


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



// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}


//app.get('/users', user.list);

//nav items
app.get('/', routes.index);
app.get('/workplay', function(req, res){
	User.findOne({username: req.user.username}, 'activities', function(error, data){
		console.log(data.activities.length);
		console.log(data.activities);
		console.log(data.activities[0].timeSpent);
		var work = 0;
		var play = 0;
		//weirdass way of looping loops
		function calculate(i) { 
			if( i < data.activities.length ) {
				if (data.activities[i].minutes) {
					if (data.activities[i].work) {
						work = work + data.activities[i].timeSpent;
					} else {
						play = play + data.activities[i].timeSpent;
					}
				} else {
					if (data.activities[i].work) {
						work = work + (data.activities[i].timeSpent * 60);
					} else {
						play = play + (data.activities[i].timeSpent * 60);
					}
				}
				calculate(i+1);
			}
		}
		calculate(0);
		//console.log("Initial minutes")
		//console.log(work);
		//console.log(play);
		workPercent = (work / (work + play)) * 100;
		playPercent = (play / (work + play)) * 100; 
		//console.log("Percentage")
		//console.log(workPercent);
		//console.log(playPercent);
		res.render('workplay', {pageData: {workPercent: workPercent, playPercent: playPercent }});
	});

	
});
app.get('/doughnut', ensureAuthenticated, routes.doughnut);
app.get('/statistics', ensureAuthenticated, routes.statistics);
app.get('/settings', ensureAuthenticated, routes.settings);
app.get('/add', ensureAuthenticated, routes.add);

//other items
app.get('/calendar', ensureAuthenticated, routes.calendar);
app.get('/details', ensureAuthenticated, routes.details);
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
