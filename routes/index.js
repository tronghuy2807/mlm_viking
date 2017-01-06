var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var Transaction = require('../models/transaction');
var router = express.Router();
var multer = require('multer');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");

var nodeExcel = require('excel-export');
var stringify=require('node-stringify');
var temp=[];

/*Storage file*/
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

/*Login, logout and register*/
router.get('/', function (req, res) {
    res.render('login', {user: req.user});
});

router.get('/login', function (req, res) {
    res.render('login', {user: req.user});
});
router.post('/login', passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',
}));

router.get('/register', function (req, res) {
    res.render('register', {});
});

router.post('/register', function (req, res) {
    uploadImg(req, res, function (err) {
        console.log('REGISTER', req.body)
        if (err) {
            console.log('Error: ', err)
            res.redirect('/');
        } else {

            if (req.body.password == req.body.confirmPass) {
                var img ='';
                if(req.files[0]){
                    img = req.files[0].originalname;
                }
                Account.register(new Account({
                    username: req.body.username,
                    fullname: req.body.fullname,
                    email: req.body.email,
                    phone: req.body.phone,
                    birthdate: req.body.birthdate,
                    sex: req.body.sex,
                    cmt: req.body.cmt,
                    org: req.body.org,
                    bankacc: req.body.bankacc,
                    bankbranch: req.body.bankbranch,
                    userID: req.body.userID,
                    leaderID: req.body.leaderID,
                    addr: req.body.addr,
                    img: img
                }), req.body.password, function (err, account) {
                    if (err) {
                        return res.render('register', {account: 'Tài khoản đã tồn tại!'});
                    }
                    passport.authenticate('local')(req, res, function () {
                        req.session.save(function (err) {
                            if (err) {
                                return next(err);
                            }
                        });
                    });
                });
            } else {
                res.render('register', {error: 'Xác nhận mật khẩu không chính xác!'});
            }
            res.redirect('/');
        }
    });
});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/login');
});

/*User profile*/
router.get('/viewProfile', function (req, res) {
    if (req.user) {
        res.render('viewProfile',{user:JSON.stringify(req.user)})
    } else {
        res.render('login');
    }
});
router.post('/updateProfile',function (req,res) {
    console.log('Update Profile: ',req.body);
    Account.findOne({username:req.body.username}, function (err, data) {
        // Handle any possible database errors
        if (err) {
            res.status(500).send(err);
        } else {

            // Update each attribute with any possible attribute that may have been submitted in the body of the request
            // If that attribute isn't in the request body, default back to whatever it was before.
            data.fullname = req.body.fullname|| data.fullname
            data.email = req.body.email || data.email;
            data.birthdate = req.body.birthdate || data.birthdate;
            data.sex = req.body.sex || data.sex;
            data.cmt = req.body.cmt || data.cmt;
            data.org = req.body.org || data.org;
            data.bankacc = req.body.bankacc || data.bankacc;
            data.bankbranch = req.body.bankbranch || data.bankbranch;
            data.userID = req.body.userID || data.userID;
            data.leaderID = req.body.leaderID || data.leaderID;
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

/*User list*/
router.get('/userTable', function (req, res) {
    if (req.user) {
        Account.find({}, {_id: 0, salt: 0, hash: 0}, function (err, data) {
            if (err) throw err;

            // object of all the users
            res.render('userTable', {data: JSON.stringify(data)});
        });
    } else {
        res.render('login');
    }
});
router.get('/userTree', function (req, res) {
    if (req.user) {
        Account.find({}, {_id: 0, salt: 0, hash: 0}, function (err, data) {
            if (err) throw err;

            // object of all the users
            res.render('userTree', {data: JSON.stringify(data)});
        });
    } else {
        res.render('login');
    }
});
router.post('/userTableEdit',function (req,res) {

    Account.findOne({username:req.body.username}, function (err, data) {
        // Handle any possible database errors
        if (err) {
            res.status(500).send(err);
        } else {
            data.fullname = req.body.fullname|| data.fullname
            data.email = req.body.email || data.email;
            data.birthdate = req.body.birthdate || data.birthdate;
            data.sex = req.body.sex || data.sex;
            data.cmt = req.body.cmt || data.cmt;
            data.org = req.body.org || data.org;
            data.bankacc = req.body.bankacc || data.bankacc;
            data.bankbranch = req.body.bankbranch || data.bankbranch;
            data.userID = req.body.userID || data.userID;
            data.leaderID = req.body.leaderID || data.leaderID;
            data.addr = req.body.addr || data.addr;
            data.phone = req.body.phone || data.phone;
            // Save the updated document back to the database
            data.save(function (err, result) {
                if (err) {
                    res.status(500).send(err)
                }
            });
            res.redirect('/userTable');
        }
    });
});

router.post('/userTableDelete',function (req,res) {

    Account.remove({ username: req.body.username}, function(err) {
        if (!err) {
            res.redirect('/userTable');
        }
        else {
            console.log('TABLEUPDATEEROR',req.body);
            res.redirect('/userTable');
        }
    });
});

router.post('/userTableAdd',function (req,res) {
        if (req.body.password == req.body.confirmPass) {
            Account.register(new Account({
                username: req.body.username,
                fullname: req.body.fullname,
                email: req.body.email,
                phone: req.body.phone,
                birthdate: req.body.birthdate,
                sex: req.body.sex,
                cmt: req.body.cmt,
                org: req.body.org,
                bankacc: req.body.bankacc,
                bankbranch: req.body.bankbranch,
                userID: req.body.userID,
                leaderID: req.body.leaderID,
                addr: req.body.addr
            }), req.body.password, function (err, account) {
                console.log('ADDTABLE', req.body)
                if (err) {
                    // return res.render('register', {account: 'Tài khoản đã tồn tại!'});
                }
                passport.authenticate('local')(req, res, function () {

                    req.session.save(function (err) {
                        if (err) {
                            return next(err);
                        }
                        res.redirect('/userTable');
                    });
                });
            });
        }
});
/*Transaction*/

router.post('/uploadTransExcel', function (req, res) {
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
                Transaction.collection.insert(result, onInsert);
                function onInsert(err, docs) {
                    if (err) {
                        //
                    } else {
                        console.info('%d potatoes were successfully stored.', docs.length);
                    }
                }

                res.redirect('viewTransaction');
            });
        } catch (e) {
            res.json({error_code: 1, err_desc: "Corupted excel file"});
        }
    })

});
router.post('/uploadTransaction', function (req, res) {
    var result = req.body;
    Transaction.collection.insert(result, onInsert);
    function onInsert(err, docs) {
        if (err) {
            // TODO: handle error
        } else {
            console.info('%d potatoes were successfully stored.', docs.length);
        }
    }
    res.redirect('viewTransaction');
});

router.get('/viewTransaction', function (req, res) {
    if (req.user) {
        Transaction.find({}, {_id: 0}, function (err, data) {
            if (err) throw err;

            // object of all the users
            res.render('viewTransaction', {data: JSON.stringify(data)});
        });
    } else {
        res.render('login');
    }
});
router.post('/transactionEdit',function (req,res) {

    Transaction.findOne({id:req.body.id}, function (err, data) {
        // Handle any possible database errors
        if (err) {
            res.status(500).send(err);
        } else {
            console.log('Trans EDIT',req.body.id);
            data.ibname = req.body.ibname|| data.ibname;
            data.curr = req.body.curr || data.curr;
            data.time = req.body.time || data.time;
            data.id = req.body.id || data.id;
            data.deposit = req.body.deposit || data.deposit;
            data.balance = req.body.balance || data.balance;
            data.equity = req.body.equity || data.equity;
            data.lotvolume = req.body.lotvolume || data.lotvolume;
            data.usdvolume = req.body.usdvolume || data.usdvolume;
            data.commision = req.body.commision || data.commision;
            data.markup = req.body.markup || data.markup;
            data.ticket = req.body.ticket || data.ticket;
            data.opentime = req.body.opentime || data.opentime;
            data.side = req.body.side || data.side;
            data.amount = req.body.amount || data.amount;
            // Save the updated document back to the database
            data.save(function (err, result) {
                if (err) {
                    res.status(500).send(err)
                }
            });
            res.redirect('/viewTransaction');
        }
    });
});

router.post('/transactionDelete',function (req,res) {

    Transaction.remove({id: req.body.id}, function(err) {
        if (!err) {
            console.log('Trans Delete',req.body.id);
            res.redirect('/viewTransaction');
        }
        else {
            console.log('TABLEUPDATEEROR',req.body);
            res.redirect('/viewTransaction');
        }
    });
});
router.get('/report', function (req, res) {
    if (req.user) {
        Transaction.find({}, {_id: 0}, function (err, data) {
            if (err) throw err;

            // object of all the users
            res.render('report', {data: JSON.stringify(data)});
        });
    } else {
        res.render('login');
    }
});

router.post('/exportExcel', function(req, res){
    data = JSON.parse(req.body.excelData);
    var conf ={};
//  conf.stylesXmlFile = "styles.xml";
    conf.name = "mysheet";
    conf.cols = [{
        caption:'IB Name',
        type:'string',
    },
        {
            caption:'Currency',
            type:'string'

        },
        {
            caption:'Time',
            type:'string'

        },
        {
            caption:'ID',
            type:'string'

        },
        {
            caption:'Net Deposits',
            type:'string'

        },
        {
            caption:'Balance',
            type:'string'

        },
        {
            caption:'Equity',
            type:'string'

        },
        {
            caption:'Volume (lot)',
            type:'string'

        },
        {
            caption:'Volume (USD)',
            type:'string'

        },
        {
            caption:'Commision',
            type:'string'

        },
        {
            caption:'Markup',
            type:'string'

        },
        {
            caption:'Ticket',
            type:'string'

        },
        {
            caption:'OpenTime',
            type:'string'

        },
        {
            caption:'Side',
            type:'string'

        },
        {
            caption:'Amount',
            type:'string'

        }];
    // var data = [{
    //     name: 'juhi',
    //     City: 'delhi',
    //     Age: 20
    //
    // },
    //     {
    //         name: 'vaishalli',
    //         City: 'noida',
    //         Age: 21
    //
    //     },{
    //         name: 'kaushambi',
    //         City: 'gurgaon',
    //         Age: 22
    //
    //     },{
    //         name: 'suresh',
    //         City: 'delhi',
    //         Age: 70
    //
    //     }];
    console.log('Export Excel: ',data[0]);
    for(var i=0; i<data.length;i++){
        var buffer=[data[i].ibname,data[i].curr,data[i].time,data[i].id,data[i].deposit,data[i].balance,data[i].equity,data[i].lotvolume,data[i].usdvolume,data[i].commision,data[i].markup,data[i].ticket,data[i].opentime,data[i].side,data[i].amount];
        // console.log(buffer);
        temp.push(buffer);
//
    };
    // console.log(stringify(temp));
    conf.rows=temp;
    var result = nodeExcel.execute(conf);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");
    res.end(result, 'binary');
});

module.exports = router;