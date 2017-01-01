/**
 * Created by tronghuy2807 on 31/12/2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// var passportLocalMongoose = require('passport-local-mongoose');

var Transaction = new Schema({
    ibname: String,
    curr: String,
    time: Date,
    id: String,
    deposit: String,
    balance: String,
    equity: String,
    lotvolume: String,
    usdvolume: String,
    commision: String,
    markup: String,
    ticket: String,
    opentime: Date,
    side: String,
    amount: String,

});
//
// Transaction.plugin(passportLocalMongoose);

module.exports = mongoose.model('Transaction', Transaction);
