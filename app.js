const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Contact = require('./models/contact');
const titles = require('./pageHelpers/titles');
const programs = require('./pageHelpers/programs');

mongoose.connect('mongodb://localhost:27017/seneca-connect-contacts', {
    useNewURLParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () =>{
    console.log("Database connected");
});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname) );

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/contacts', async (req, res) => {
    const people = await Contact.find({});
    res.render('contacts/index', { people } );
})

app.get('/contacts/new', (req,res) => {
    res.render('contacts/new', {titles, programs});
})

app.post('/contacts', async(req, res) =>{
    const contact = new Contact(req.body.contact);
    await contact.save();
    res.redirect(`/contacts`)
})

app.listen(3000, ()=>{
    console.log('Serving on port 3000')
})