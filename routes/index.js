var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();
var multer = require('multer');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, '/home/tronghuy2807/Working/source/vik/passport-local-express4/public/uploads')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
    }
});

var upload = multer({ //multer settings
    storage: storage,
    fileFilter: function (req, file, callback) { //file filter
        if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
            return callback(new Error('Wrong extension type'));
        }
        callback(null, true);
    }
}).single('file');


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
                    if (req.files) {
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
                    } else {
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
router.post('/upload', function (req, res) {
    console.log('AAAAAAAAA', req);
    var exceltojson;
    upload(req, res, function (err) {
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

                res.json({error_code: 0, err_desc: null, data: result});
            });
        } catch (e) {
            res.json({error_code: 1, err_desc: "Corupted excel file"});
        }
    })

});

module.exports = router;