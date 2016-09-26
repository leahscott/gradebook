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

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), function(req, res) {
    res.redirect('/');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.post('/create-student', function(req, res) {
    var today = new Date(),
        year = today.getFullYear(),
        month = ("0" + (today.getMonth() + 1)).slice(-2),
        day = ("0" + today.getDate()).slice(-2),
        dateJoined = year + "-" + month + "-" + day;

    var newStudent = Student({
        first_name: req.body[0].value,
        last_name: req.body[1].value,
        class_id: req.body[2].value,
        gpa: req.body[3].value,
        active: true,
        date_added: new Date(dateJoined + " 04:00")
    });
    newStudent.save(function(err, student){
        if (err) throw err;
        res.send(student);
    });
});

router.post('/create-random-student', function(req, res) {

    var newStudent = Student({
        first_name: req.body.firstName,
        last_name: req.body.lastName,
        class_id: req.body.classId,
        gpa: req.body.gpa,
        active: req.body.active,
        date_added: req.body.dateAdded
    });
    newStudent.save(function(err, student){
        if (err) throw err;
        res.send(student);
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

        if (req.body.active == '1') {
            var isActive = true;
        } else {
            var isActive = false;
        }

        console.log(req.body);

    Student.findOneAndUpdate({'_id': studentId}, {active: isActive, first_name: firstName, last_name: lastName, class_id: classNum, gpa: gpa}, function(err, student) {
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

router.get('/filter-students', function(req, res) {
    var values = req.query;
    var query = {
        'gpa' : { '$gte' : values.fromGpa , '$lte' : values.toGpa }
    };

    // Build up query
    if (values.dateJoined) {
        var startDate = new Date(values.dateJoined);
        var endDate   = new Date(values.dateJoined);
        endDate.setHours(23,59,59,59);

        query.date_added = { '$gte' : startDate.toISOString(), '$lte' : endDate.toISOString() };
    }

    if (values.activity == 'active') {
        query.active = true;
    } else if (values.activity == 'inactive') {
        query.active = false;
    }

    console.log(query);

    Student.find(query, function(err, students){
        if (err) throw err;
        res.send(students);
    });
});

router.get('/get-featured-students', function(req,res) {
    Student.find({}).sort({gpa: 'desc'}).exec(function(err, students){
        if (err) throw err;
        // Remove all but the first and last student
        students.splice(1, students.length - 2);
        res.send(students);
    });

});

router.get('/get-all-students', function(req, res) {
    Student.find({}, function(err, students){
        if (err) throw err;
        res.send(students);
    });
});


module.exports = router;