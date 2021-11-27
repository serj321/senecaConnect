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

//Connects to local database, if no database exists that has this name
//it will create one.
mongoose.connect('mongodb://localhost:27017/seneca-connect-contacts', {
    useNewURLParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () =>{
    console.log("Database connected");
});

//sets up ejs as the view engine and sets up the view directory to the current directory
//then views
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//configurating a session
const sessionConfig = {
    secret: 'notagoodsecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, 
        // sets up the session to expire a week from now and sets a max
        // age of a week. This formula will take the current date and add on 
        // a week in milliseconds to it.
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        // this formula sets the maxAge as a week in milliseconds.
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));

//sets up passport which is used for authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(express.urlencoded({ extended: true }));

//sets up method override so different HTTP verbs can be used like 
app.use(methodOverride('_method'));

app.use(express.static(__dirname) );

//assigns the user in the session to the currentUser local variable 
//everytime a page is entered.
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
})


//takes the user to the home page
app.get('/', (req, res) => {
    res.redirect('/contacts');
})

//Renders the register page to the user
app.get('/register', (req, res) =>{
    res.render('users/register');
})

//Creates a new account and then redirects to contacts
app.post('/register', async(req, res) =>{
    const {username, password, isAdminStr} = req.body;
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

//Renders login form to user
app.get('/login', (req, res) => {
    res.render('users/login');
})

//Logs in user
app.post('/login', passport.authenticate('local', { failureFlash: false, failureRedirect: '/login'}), (req, res) => {
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

//provides the new contact page
app.get('/contacts/new', isLoggedIn, isUserAdmin, (req,res) => {
    res.render('contacts/new', {titles, programs});
})

//provides the edit page with all th eusers current information
app.get('/contacts/:id/edit', isLoggedIn, isUserAdmin, async (req, res) => {
    const contact = await Contact.findById(req.params.id);
    res.render('contacts/edit', {contact, titles, programs});
})

//uses parameters provided by the user to dynamically build a mongoose query to return the results
//that the user is looking for
app.get('/contacts/filtered', isLoggedIn, async (req, res) => {
    var title, name, program;
    var query = {};
    if(req.query.titleFilter != "Select a Title"){
        title = req.query.titleFilter;
        query["title"] = title;
    }
    if(req.query.programFilter != "Select a Program"){
        program = req.query.programFilter;
        query["program"] = program;
    }
    if(req.query.name)
    {
        name = req.query.name
        query["name"] = name;
    }
    const people = await Contact.find(query);
    res.render('contacts/index', { people });
})

//creates a new contact and adds it to the database
app.post('/contacts', isUserAdmin, async(req, res) =>{
    const contact = new Contact(req.body.contact);
    await contact.save();
    res.redirect(`/contacts`);
})

//updates contact with new given information
app.put('/contacts/:id', isUserAdmin, async(req, res) => {
    const { id } = req.params;
    await Contact.findByIdAndUpdate(id, { ...req.body.contact })
    res.redirect('/contacts');
})

//deletes a contact
app.delete('/contacts/:id', isUserAdmin, async(req, res) => {
    const { id } = req.params;
    await Contact.findByIdAndDelete(id);
    res.redirect('/contacts');
})

//server will listen on port 3000
app.listen(3000, ()=>{
    console.log('Serving on port 3000')
})