var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Student = new Schema(
	{
	    first_name  : String,
	    last_name   : String,
	    class_id    : Number,
	    gpa		    : Number,
	    active	    : Boolean,
	    date_added : Date
	},
	{
		autoIndex: false
	}
);

Student.plugin(passportLocalMongoose);

module.exports = mongoose.model('Student', Student);