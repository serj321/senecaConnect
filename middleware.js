//checks if someone is logged in by checking the .isAuthenticated() method that is automatically
//added to the req parameter by passport
module.exports.isLoggedIn = (req, res, next) =>{
    if(!req.isAuthenticated()){
        return res.redirect('/login');
    }
    next();
}

//checks if the current user in teh session is an admin by using the .isAdmin boolean variable
module.exports.isUserAdmin = (req, res, next) =>{
    if(!req.user.isAdmin){
        return res.redirect('../contacts');
    }
    next();
}