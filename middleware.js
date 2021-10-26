module.exports.isLoggedIn = (req, res, next) =>{
    if(!req.isAuthenticated()){
        return res.redirect('/login');
    }
    next();
}

module.exports.isUserAdmin = (req, res, next) =>{
    if(!req.user.isAdmin){
        return res.redirect('../contacts');
    }
    next();
}