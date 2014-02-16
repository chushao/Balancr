var hash = require('../hash');
var mongoose = require('mongoose');

//Database schema models
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var Goal = new Schema( {
	name : { type: String }
  , description : { type: String }
  , Date : Date
})

var Activity = new Schema( {
	activity : { type: String }
  , category : { type: String }
  , timeSpent : Number
  , minutes :  Boolean
  , work : Boolean
  , date : { type: String }
});

var User = new Schema( {
	id: Number
  , email: { type: String, default: '' }
  , salt: { type: String, default: ''}
  , hash: { type: String, default: ''}
  , username: { type: String, default: '' }
  , goals: [Goal] //Goal is empty, need to do a .array.push() for goals
  , activities: [Activity] //Array of multiple Activity object
  , categories: [] //Just a list of categories that has been used for activities of this user
});

User.statics.signup = function(email, password, done){
	var User = this;
	hash(password, function(err, salt, hash){
		if(err) throw err;
		// if (err) return done(err);
		User.create({
			id: Math.floor((Math.random()*1000)+1),
			email : email,
			salt : salt,
			hash : hash,
			username: email,
			categories : [ 	"Work", "Exercise",
 					 		"Entertainment", "School",
 					 		"Social", "Errands",
 					  		"Family", "Other" ]
		}, function(err, user){
			if(err) throw err;
			// if (err) return done(err);
			done(null, user);
		});
	});
}

User.statics.isValidUserPassword = function(email, password, done) {
	this.findOne({email : email}, function(err, user){
		// if(err) throw err;
		if(err) return done(err);
		if(!user) return done(null, false, { message : 'Incorrect email.' });
		hash(password, user.salt, function(err, hash){
			if(err) return done(err);
			if(hash == user.hash) return done(null, user);
			done(null, false, {
				message : 'Incorrect password'
			});
		});
	});
};

var User = mongoose.model('User', User);
module.exports = User;