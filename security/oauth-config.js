'use strict';

const passport = require("passport");
const BasicStrategy = require("passport-http").BasicStrategy;

//Table of users : it gives the correspondance between username and blockchain userid
let users = {
    admin: { password: 'password', name: 'Admin (org1)', bcuser: 'admin' },
    user1: { password: 'pwdu1', name: 'User1 (org1)', bcuser: 'supplier1', bcpwd: 'pwdsupp1' },
    user2: { password: 'pwdu2', name: 'User2 (org1)', bcuser: 'customer1', bcpwd: 'pwdcust1' },
    user3: { password: 'pwdu3', name: 'User3 (org2)', bcuser: 'carrier1', bcpwd: 'pwdcarr1' },
    user4: { password: 'pwdu4', name: 'User4 (org1)', bcuser: 'supplier2', bcpwd: 'pwdsupp2' },
    user5: { password: 'pwdu5', name: 'User5 (org1)', bcuser: 'customer2', bcpwd: 'pwdcust2' }
};

//The passport module is an interface which allows to handle the authentication
passport.use(new BasicStrategy(function (username, password, done) {
    // put here you user/password control system
    if (users[username] && users[username].password == password) {
        console.log("username: " + users[username].name + " is authenticated with userid: " + username);
        return done(null, { user: username, name: users[username].name, bcuser: users[username].bcuser, bcpwd: users[username].bcpwd });
    }
    console.log("username: " + username + " not authenticated!!!");
    return done(null, false);
}));
