var express = require('express');
var router = express.Router();
var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var Transaction = require('../models/transaction');
/* GET users listing. */
router.get('/users/viewTable', function (req, res) {
    if (req.user) {
        Account.find({}, {_id: 0, salt: 0, hash: 0}, function (err, data) {
            if (err) throw err;

            // object of all the users
            res.render('viewTable', {data: JSON.stringify(data)});
        });
    } else {
        res.render('login');
    }
});
router.get('/users/viewTree', function (req, res) {
    if (req.user) {
        Account.find({}, {_id: 0, salt: 0, hash: 0}, function (err, data) {
            if (err) throw err;

            // object of all the users
            res.render('viewTree', {data: JSON.stringify(data)});
        });
    } else {
        res.render('login');
    }
});

router.get('/users/viewProfile', function (req, res) {
    if (req.user) {
        res.render('viewProfile', {user: JSON.stringify(req.user)})
    } else {
        res.render('login');
    }
});

/* POST */
router.post('/users/tableUpdate', function (req, res) {
    console.log('TABLEUPDATE', req.body);
    if (req.user) {
        Account.find({}, {_id: 0, salt: 0, hash: 0}, function (err, data) {
            if (err) throw err;

            // object of all the users
            res.render('viewTable', {data: JSON.stringify(data)});
        });
    } else {
        res.render('login');
    }
});

router.post('/users/updateProfile', function (req, res) {
    console.log('Update Profile: ', req.body);
    Account.findOne({username: req.body.username}, function (err, data) {
        // Handle any possible database errors
        if (err) {
            res.status(500).send(err);
        } else {

            // Update each attribute with any possible attribute that may have been submitted in the body of the request
            // If that attribute isn't in the request body, default back to whatever it was before.
            data.fullname = req.body.fullname || data.fullname
            data.email = req.body.email || data.email;
            data.birthdate = req.body.birthdate || data.birthdate;
            data.sex = req.body.sex || data.sex;
            data.cmt = req.body.cmt || data.cmt;
            data.org = req.body.org || data.org;
            data.bankacc = req.body.bankacc || data.bankacc;
            data.bankbranch = req.body.bankbranch || data.bankbranch;
            data.id = req.body.id || data.id;
            data.parentId = req.body.parentId || data.parentId;
            data.addr = req.body.addr || data.addr;
            data.phone = req.body.phone || data.phone;
            // Save the updated document back to the database
            data.save(function (err, result) {
                if (err) {
                    res.status(500).send(err)
                }
            });
            res.redirect('/viewProfile');
        }
    });
});

module.exports = router;
