const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Contact = require('./models/contact');
const titles = require('./pageHelpers/titles');
const programs = require('./pageHelpers/programs');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const session = require('express-session');
const {isLoggedIn, isUserAdmin} = require('./middleware');

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

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, 
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(express.static(__dirname) );

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
})

app.get('/', (req, res) => {
    res.render('home')
})

//Directs to the register page
app.get('/register', (req, res) =>{
    res.render('users/register');
})

//Creates a new account and then redirects to contacts
app.post('/register', async(req, res) =>{
    const {username, password, isAdminStr} = req.body;
    console.log(isAdminStr);
    var isAdmin = (isAdminStr === "true");
    const user = new User({username, isAdmin});
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, err => {
        if(err){
            console.log(err);
            return res.redirect('/register');
        }
    });
    res.redirect('/contacts');
})

//Provides login form
app.get('/login', (req, res) => {
    res.render('users/login');
})

//Logs in user
app.post('/login', passport.authenticate('local', { failureFlash: false, failureRedirect: '/login'}), (req, res) => {
    console.log("hello");
    res.redirect('/contacts');
})

//Logs out user
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
})

//Obtains all contacts from the database and then populates the page but checks if user is logged in
app.get('/contacts', isLoggedIn, async (req, res) => {
    const people = await Contact.find();
    res.render('contacts/index', { people } );
})

app.get('/contacts/new', isLoggedIn, isUserAdmin, (req,res) => {
    res.render('contacts/new', {titles, programs});
})

// app.get('/fakeUser', async(req, res) => {
//     const user = new User({ email: 'ssililian@myseneca.ca', username: "serj", isAdmin: true});
//     const newUser = await User.register(user, 'fluffy');
//     res.send(newUser);
// })

app.get('/contacts/:id/edit', isUserAdmin, async(req, res) => {
    const contact = await Contact.findById(req.params.id)
    res.render('contacts/edit', {contact, titles, programs});
})

app.get('/contacts/filtered', isLoggedIn, async(req, res) =>{
    console.log(req.query);
    var title, name, program;
    var query = {};
    if(req.query.titleFilter != "Select a Title"){
        title = req.query.titleFilter;
        console.log(title);
        query["title"] = title;
    }
    if(req.query.programFilter != "Select a Program"){
        program = req.query.programFilter;
        console.log(program);
        query["program"] = program;
    }
    if(req.query.name)
    {
        console.log("there is a name!");
        name = req.query.name
        query["name"] = name;
    }
    const people = await Contact.find(query);
    res.render('contacts/index', { people })
})

app.post('/contacts', isUserAdmin, async(req, res) =>{
    const contact = new Contact(req.body.contact);
    await contact.save();
    res.redirect(`/contacts`)
})

app.put('/contacts/:id', isUserAdmin, async(req, res) => {
    const { id } = req.params;
    await Contact.findByIdAndUpdate(id, { ...req.body.contact })
    res.redirect('/contacts');
})

app.delete('/contacts/:id', isUserAdmin, async(req, res) => {
    const { id } = req.params;
    await Contact.findByIdAndDelete(id);
    res.redirect('/contacts');
})

app.listen(3000, ()=>{
    console.log('Serving on port 3000')
})