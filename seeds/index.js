const mongoose = require('mongoose');
const Contact = require('../models/contact');
const people = require('./contacts');

//This seeds folder was created to help start the database with some sample data,
//that's why we called it a seed. This data is just to quickly populate the database 
//with something that can then populate the pages.

mongoose.connect('mongodb://localhost:27017/seneca-connect-contacts', {
    useNewURLParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () =>{
    console.log("Database connected");
});

const seedDB = async() => {

    //delete all the contacts on the database and then itterate throught the contacts.js file
    // while uploading the data to the database
    await Contact.deleteMany({});
    for ( let person of people){
        const program = person.program;
        const contact = new Contact({
            name: person.name,
            title: person.title,
            email: person.email,
            phoneNumber: person.phoneNumber,
            studentNumber: person.studentNumber,
            program
        })
        await contact.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});