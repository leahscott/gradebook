var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var Student = require('../models/student');
var router = express.Router();


router.get('/', function (req, res) {
    Student.find({}, function(err, students){
        if (err) {
            throw err;
            console.log(err);
        }
        console.log("fetched students");
        res.render('index', {
            user : req.user,
            students: students
        });
    });
});

router.get('/register', function(req, res) {
    res.render('register', { });
});

router.post('/register', function(req, res) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
            return res.render('register', { account : account });
        }

        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    });
});

router.get('/login', function(req, res) {
    res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.post('/create-student', function(req, res) {
    var newStudent = Student({
        first_name: req.body[0].value,
        last_name: req.body[1].value,
        class_id: req.body[2].value,
        gpa: req.body[3].value
    });
    newStudent.save(function(err){
        if (err) throw err;

        console.log('Student Created');
        res.send(req.body);
    });
});

module.exports = router;