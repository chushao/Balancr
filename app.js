
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
// TODO remove later as this resets the database everytime. 
User.remove().exec();
//Seed the database
/**
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
}); **/
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
app.get('/workplay/:year/:month/:day', ensureAuthenticated, function(req,res) {
		//Convert year/month/day from path to databasecall
		var queryDate = req.params.year+'-'+req.params.month+'-'+req.params.day;
	User.findOne({username: req.user.username}, 'activities', function(error, data){	
		var work = 0;
		var play = 0;
		//weirdass way of looping loops
		function calculate(i) { 
			if( i < data.activities.length ) {
				var date = new Date(data.activities[i].date);
				var qDate = new Date(queryDate);
				if ((date.getYear() == qDate.getYear()) && (date.getDate() == qDate.getDate()) && (date.getMonth() == qDate.getMonth())) {
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
				}
				calculate(i+1);
			}
				
		}
		calculate(0);
		workPercent = Math.round( ((work / (work + play)) * 100) * 100) / 100;
		playPercent = Math.round( ((play / (work + play)) * 100) * 100) / 100; 
		var workGraph = isNaN(workPercent) ? 50 : workPercent;
		var playGraph = isNaN(playPercent) ? 50 : playPercent;
		if (isNaN(workPercent)) { workPercent = 0;}
		if (isNaN(playPercent)) { playPercent = 0;}
		res.render('workplay', {pageData: {wpDate: queryDate, workGraph: workGraph, playGraph: playGraph, workPercent: workPercent, playPercent: playPercent }});
	
	});
});
app.get('/workplay', ensureAuthenticated, function(req, res){
	User.findOne({username: req.user.username}, 'activities', function(error, data){
		var work = 0;
		var play = 0;
		//weirdass way of looping loops
		function calculate(i) { 
			if( i < data.activities.length ) {
				var date = new Date(data.activities[i].date);
				var today = new Date();
				if ((date.getYear() == today.getYear()) && (date.getDate() == today.getDate()) && (date.getMonth() == today.getMonth())) {
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
				}
				calculate(i+1);
			}
				
		}
		calculate(0);
		workPercent = Math.round( ((work / (work + play)) * 100) * 100) / 100;
		playPercent = Math.round( ((play / (work + play)) * 100) * 100) / 100; 
		var workGraph = isNaN(workPercent) ? 50 : workPercent;
		var playGraph = isNaN(playPercent) ? 50 : playPercent;
		if (isNaN(workPercent)) { workPercent = 0;}
		if (isNaN(playPercent)) { playPercent = 0;}
		res.render('workplay', {pageData: {wpDate: 'today', workGraph: workGraph, playGraph: playGraph, workPercent: workPercent, playPercent: playPercent }});
	});

	
});
app.get('/doughnut', ensureAuthenticated, routes.doughnut);
app.get('/statistics', ensureAuthenticated, routes.statistics);
app.get('/settings', ensureAuthenticated, routes.settings);
app.get('/add', ensureAuthenticated, routes.add);
app.post('/add', ensureAuthenticated, function(req, res) {
	User.findOne({username: req.user.username}, function(error, user){
		if(error){
				console.log(error);
			}
			else if(user == null){
				console.log('no such user!')
			} else{
				//Data converter
				var timeUnit = true;
				req.body.timeUnit == "minutes" ? timeUnit = true : timeUnit = false;
				var workUnit = true;
				req.body.workplayRadios == 'work' ? workUnit = true : workUnit = false;
				date = new Date();
				var month = date.getMonth() + 1; //Off by 1 error for getMonth
				var fullDate = date.getFullYear().toString() + '-' + month.toString() + '-' + date.getDate().toString();
				user.activities.push({
					"activity" : req.body.activity,
					"category" : req.body.category,
					"timeSpent" : req.body.timeSpent,
					"minutes" : timeUnit,
					"work" : workUnit,
					"date" : fullDate
				});
				user.save( function(error, data){
					if(error){
						console.log(error);
					} else{
						console.log(data);
					}
				});
			}
		});
	res.redirect('/workplay');
})

//other items
app.get('/calendar', ensureAuthenticated, routes.calendar);
app.get('/details', ensureAuthenticated, routes.details);
app.get('/signup', routes.signup);
app.post('/signup', function (req, res, next) {
		User.signup(req.body.email, req.body.password, function(err, user){
			if(err) throw err;
			req.login(user, function(err){
				if(err) return next(err);
				return res.redirect("/workplay");
			});
		});
	});
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
