const passport = require("passport");

/*
 * Check basic Auth
 */
module.exports.checkbasicauth= function(req, res, next) {
	console.log('starting checkbasicauth...');
	passport.authenticate('basic',{ session: false }, function(err, user, info) {
		req.isAuthenticated=false;
		req.basicAuth={};
		if(user && user.user) {
			//req.basicAuth.bcuser = 'admin';
			req.basicAuth.user = user.user;
            req.basicAuth.bcuser = user.bcuser;
            req.basicAuth.bcpwd = user.bcpwd;
			req.basicAuth.role = (user.role?user.role:'');
			req.basicAuth.org = (user.org?user.org:'');
		} 
		else
			req.basicAuth.err= 'usernotfound';
		if(info)
			req.basicAuth.authInfo= info;
		if (err)
			req.basicAuth.err= err;
		if(user && !err)
			req.isAuthenticated=true;
		return next();
	})(req, res, next);
};
