const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
// Creates a schema for users when creating accounts or logging in.
// Sets up different variabls and certain parameters (if it's required, or if it 
// can only be of specific values, etc). This scema only shows the isAdmin variable because
// passport adds the username and password field on its own.
const UserSchema = new Schema({
    isAdmin: {
        type: Boolean,
        required: true
    }
})

//this is where passport will add username and password to the schema
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);