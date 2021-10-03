const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');

const Contact = require('./models/contact');

mongoose.connect('mongodb://localhost:27017/seneca-connect-contacts', {
    useNewURLParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () =>{
    console.log("Database connected");
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/contacts', async (req, res) => {
    const people = await Contact.find({});
    res.render('contacts', { people } );
})

app.listen(3000, ()=>{
    console.log('Serving on port 3000')
})