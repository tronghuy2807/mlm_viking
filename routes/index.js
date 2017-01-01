var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var Transaction = require('../models/transaction');
var router = express.Router();
var multer = require('multer');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");

var storageExcel = multer.diskStorage({ //multers disk storageExcel settings
    destination: function (req, file, cb) {
        cb(null, 'public/excel')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
    }
});

var uploadExcel = multer({ //multer settings
    storage: storageExcel,
    fileFilter: function (req, file, callback) { //file filter
        if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
            return callback(new Error('Wrong extension type'));
        }
        callback(null, true);
    }
}).single('file');

var storageImg = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'public/uploadImgs');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
var uploadImg = multer({storage: storageImg}).array('file');
router.get('/home', function (req, res) {
    if (req.user) {
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
    uploadImg(req, res, function (err) {
        console.log('REGISTER', req.body)
        if (err) {
            console.log('XXXXX',err)
            res.redirect('/');
        }else {

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
                            console.log('YYYYYYY')

                        });
                    });
                });
            } else {
                res.render('register', {error: 'Xác nhận mật khẩu không chính xác!'});
            }
            console.log('ZZZZZZ')
            res.redirect('/');
        }
    });
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
router.get('/viewInputTrans', function (req, res) {
    if (req.user) {
        res.render('viewInputTrans')
    } else {
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
    } else {
        res.render('login');
    }
});

router.get('/viewProfile', function (req, res) {
    if (req.user) {
        res.render('viewProfile')
    } else {
        res.render('login');
    }
});
router.get('/uploadExcel', function (req, res) {
    if (req.user) {
        res.render('uploadExcel');
    } else {
        res.render('login');
    }
});
router.post('/upTest', function (req, res) {

    uploadImg(req, res, function (err) {
        console.log('TEST', req)
        if (err) {
            res.redirect('/');
        }
        res.redirect('/');

    });
});
router.post('/uploadTrans', function (req, res) {
    var exceltojson;
    uploadExcel(req, res, function (err) {
        if (err) {
            res.json({error_code: 1, err_desc: err});
            return;
        }
        /** Multer gives us file info in req.file object */
        if (!req.file) {
            res.json({error_code: 1, err_desc: "No file passed"});
            return;
        }
        /** Check the extension of the incoming file and
         *  use the appropriate module
         */
        if (req.file.originalname.split('.')[req.file.originalname.split('.').length - 1] === 'xlsx') {
            exceltojson = xlsxtojson;
        } else {
            exceltojson = xlstojson;
        }
        console.log(req.file.path);
        try {
            exceltojson({
                input: req.file.path,
                output: null, //since we don't need output.json
                lowerCaseHeaders: true
            }, function (err, result) {
                if (err) {
                    return res.json({error_code: 1, err_desc: err, data: null});
                }
                xxx = JSON.parse(JSON.stringify(result));
                console.log('XXXX', xxx);
                Transaction.collection.insert(result, onInsert);
                function onInsert(err, docs) {
                    if (err) {
                        // TODO: handle error
                    } else {
                        console.info('%d potatoes were successfully stored.', docs.length);
                    }
                }

                res.json({error_code: 0, err_desc: null, data: result});
            });
        } catch (e) {
            res.json({error_code: 1, err_desc: "Corupted excel file"});
        }
    })

});

module.exports = router;