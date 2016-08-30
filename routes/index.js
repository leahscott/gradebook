var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var Student = require('../models/student');
var router = express.Router();


router.get('/', function (req, res) {
    Student.find({}, function(err, students){
        if (err) throw err;
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
    newStudent.save(function(err, student){
        if (err) throw err;

        console.log('Student Created');
        req.body.push({name: 'id', value: student.id});
        console.log(req.body);
        res.send(req.body);
    });
});

router.get('/edit/:id', function(req, res) {
    var id = req.params.id;
    Student.findOne({'_id': id}, function(err, student){
        if (err) throw err;

        res.render('edit', {
            student: student,
            user : req.user
        });
    });
});

router.post('/edit', function(req, res) {
    var studentId = req.body.student_id,
        firstName = req.body.first_name,
        lastName = req.body.last_name,
        classNum = req.body.class,
        gpa = req.body.gpa;

        console.log(req.body);

    Student.findOneAndUpdate({'_id': studentId}, {first_name: firstName, last_name: lastName, class_id: classNum, gpa: gpa}, function(err, student) {
        if (err) throw err;
        res.redirect('/');
    });
});

router.get('/destroy/:id', function(req, res) {
    var id = req.params.id;
    Student.findOneAndRemove({'_id': id}, function(err, student){
        if (err) throw err;
        console.log('student deleted');
        res.send(student);
    });
});

module.exports = router;