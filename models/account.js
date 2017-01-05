/**
 * Created by tronghuy2807 on 19/12/2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    username: String,
    password: String,
    fullname: String,
    email: String,
    phone: String,
    birthdate: String,
    sex: String,
    cmt: String,
    org: String,
    bankacc: String,
    bankbranch: String,
    userID: String,
    leaderID: String,
    addr: String,
    img:String
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);