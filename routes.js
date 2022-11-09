'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const pug = require("pug");
const passport = require("passport");
const session = require("express-session");
const { ObjectID } = require('mongodb');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');

module.exports = function (app, myDataBase) {
    app.route('/').get((req, res) => {
    res.render('index.pug', {
      title: 'Connected to Database',
      message: 'Please login',
      showLogin: true,
      showRegistration: true,
      showSocialAuth: true
    });
  });

  app.route('/login').post((req, res)=>{
    passport.authenticate('local', {failureRedirect: '/' });
    res.redirect("/");
  });

  app.route('/auth/github').get(passport.authenticate('github'));

  app.route("/auth/github/callback").get(
    passport.authenticate('github', { failureRedirect: '/' }),
    (req, res) => {
      req.session.user_id = req.user.id
      res.redirect('/chat');});

    app.route('/logout')
  .get((req, res) => {
    req.logout();
    res.redirect('/');
});

app.route('/register')
  .post((req, res, next) => {
    myDataBase.findOne({ username: req.body.username }, (err, user) => {
      if (err) {
        next(err);
      } else if (user) {
        res.redirect('/');
      } else {
        const hash = bcrypt.hashSync(req.body.password, 12);
        myDataBase.insertOne({
          username: req.body.username,
          password: hash
        },
          (err, doc) => {
            if (err) {
              res.redirect('/');
            } else {
              next(null, doc.ops[0]);
            }
          }
        )
      }
    })
  },
    passport.authenticate('local', { failureRedirect: '/' }),
    (req, res, next) => {
      res.redirect('/profile');
    }
  );



    function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  };

  app.route('/profile').get(ensureAuthenticated, (req, res)=>{
    res.render("/profile.pug", {username: req.user.username});
  })

  app.route("/chat").get(ensureAuthenticated, (req, res)=>{
    res.render("/chat.pug", { user: req.user })
  })

}