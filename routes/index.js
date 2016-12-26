var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();


router.get('/home', function (req, res) {
    if(req.user){
        res.render('index', {user: req.user});
    } else {
        res.render('login');
    }
});
router.get('/', function (req, res) {
    res.render('login', {user: req.user});
});

router.get('/register', function (req, res) {
    res.render('register', {});
});

router.post('/register', function (req, res) {
    console.log('AAA',req.files);
    if (req.body.password == req.body.confirmPass) {
        Account.register(new Account({
            username: req.body.username,
            fullname: req.body.fullname,
            email: req.body.email,
            phone: req.body.phone,
            leaderPhone: req.body.leaderPhone
        }), req.body.password, function (err, account) {
            if (err) {
                return res.render('register', {account: 'Tài khoản đã tồn tại!'});
            }
            passport.authenticate('local')(req, res, function () {
                req.session.save(function (err) {
                    if (err) {
                        return next(err);
                    }
                    if(req.files) {
                        var sampleFile;
                        sampleFile = req.files.sampleFile;
                        imgName = sampleFile.name;
                        sampleFile.mv('public/uploads/' + imgName, function (err) {
                            if (err) {
                                res.redirect('/');
                            }
                            else {
                                res.redirect('/');
                            }
                        });
                    }else {
                        res.redirect('/');
                    }
                });
            });
        });
    } else {
        res.render('register', {error: 'Xác nhận mật khẩu không chính xác!'});
    }
});

router.get('/login', function (req, res) {
    res.render('login', {user: req.user});
});

// router.post('/login', passport.authenticate('local'), function(req, res) {
//   res.redirect('/home');
// });
router.post('/login', passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',
}));

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/login');
});

router.get('/ping', function (req, res) {
    res.status(200).send("pong!");
});

router.get('/viewTable', function (req, res) {
    if(req.user) {
        Account.find({}, {_id: 0, salt: 0, hash: 0}, function (err, data) {
            if (err) throw err;

            // object of all the users
            res.render('viewTable', {data: JSON.stringify(data)});
        });
    }else {
        res.render('login');
    }
});
router.get('/viewTree', function (req, res) {
    if (req.user) {
        Account.find({}, {_id: 0, salt: 0, hash: 0}, function (err, data) {
            if (err) throw err;

            // object of all the users
            res.render('viewTree', {data: JSON.stringify(data)});
        });
    }else {
        res.render('login');
    }
});

router.get('/viewProfile',function (req,res) {
   if(req.user){
       res.render('viewProfile')
   }else {
       res.render('login');
   }
});
module.exports = router;