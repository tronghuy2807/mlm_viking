var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();


router.get('/home', function (req, res) {
  res.render('index', { user : req.user });
});
router.get('/', function (req, res) {
  res.render('login', { user : req.user });
});

router.get('/register', function(req, res) {
  res.render('register', { });
});

router.post('/register', function(req, res) {
  Account.register(new Account({ username : req.body.username, fullname: req.body.fullname, email:req.body.email,phone: req.body.phone, leaderPhone: req.body.leaderPhone }), req.body.password, function(err, account) {
    if (err) {
      return res.render('register', { account : account });
    }

    passport.authenticate('local')(req, res, function () {
      res.redirect('/home');
    });
  });
});

router.get('/login', function(req, res) {
  res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
  res.redirect('/home');
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/home');
});

router.get('/ping', function(req, res){
  res.status(200).send("pong!");
});

router.get('/viewTable',function (req,res) {
  Account.find({},{_id:0,salt:0,hash:0}, function(err, data) {
    if (err) throw err;

    // object of all the users
    res.render('viewTable',{data:JSON.stringify(data)});
  });
});
router.get('/viewTree',function (req,res) {
  Account.find({},{_id:0,salt:0,hash:0}, function(err, data) {
    if (err) throw err;

    // object of all the users
    res.render('viewTree',{data:JSON.stringify(data)});
  });
});
module.exports = router;