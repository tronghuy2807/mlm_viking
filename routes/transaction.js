/**
 * Created by tronghuy2807 on 05/01/2017.
 */

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

router.get('/transaction/viewInputTrans', function (req, res) {
    if (req.user) {
        res.render('viewInputTrans')
    } else {
        res.render('login');
    }
});
router.post('/transaction/uploadTrans', function (req, res) {
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

                res.render('viewInputTransExcel');
            });
        } catch (e) {
            res.json({error_code: 1, err_desc: "Corupted excel file"});
        }
    })

});

router.post('/transaction/uploadTransHand', function (req, res) {
    var result = req.body;
    Transaction.collection.insert(result, onInsert);
    function onInsert(err, docs) {
        if (err) {
            //
        } else {
            console.info('%d potatoes were successfully stored.', docs.length);
        }
    }

    res.render('viewInputTrans');
});

router.get('/transaction/viewInputTransExcel', function (req, res) {
    if (req.user) {
        res.render('viewInputTransExcel', {user: JSON.stringify(req.user)})
    } else {
        res.render('login');
    }
});

router.get('/viewStatistics', function (req, res) {
    if (req.user) {
        Transaction.find({}, {_id: 0}, function (err, data) {
            if (err) throw err;

            // object of all the users
            res.render('viewStatistics', {data: JSON.stringify(data)});
        });
    } else {
        res.render('login');
    }
});
