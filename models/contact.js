const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// Creates a schema for contacts when adding or pulling to/from the database.
// Sets up different variabls and certain parameters (if it's required, or if it 
// can only be of specific values, etc).
const ContactSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    title: {
        type: String,
        enum: ["Staff", "Student"],
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: false
    },
    studentNumber: {
        type: String,
        required: false
    },
    program: {
        type: String,
        required: false,
        enum: 
            [
                "Computer Engineering Technology", "Civil Engineering Technology",
                "Electronics Engineering Technology", "Electrical Engineering Technology",
                "Mechanical Engineering Technology", ""
            ]
    },
})

const Contact = mongoose.model('Contact', ContactSchema);

//Exports the schema to be used in other js files.
module.exports = Contact;