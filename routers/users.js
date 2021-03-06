const express = require('express')
const router = express.Router()
const User = require('../models/users')
const bCrypt = require('bcryptjs')
const passport = require('passport')

//login route
router.get('/login', (req,res) => res.render('login', {req}))

//Register route
router.get('/register', (req,res) => res.render('register', {req}))

//handel register
router.post('/register', (req, res) => {
    //init user values
    const { name, email, password, password2 } = req.body

    //validations
    let errors = [];
    if(!name || !email || !password || !password2)
    errors.push({msg:'please fill all fields'})

    //validate passwords match
    if(name && email && password && password2 && password!==password2)
    errors.push({msg:"passwords didn't match"})

    if(password && password.length < 8)
    errors.push({msg:'password should be at least 8 charcters'})

    if(errors.length > 0){
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2,
            req
        })
    }else{
        //check for existing email
        User.findOne({email:email})
        .then(user => {
            if(user){
                errors.push({msg:'Email is already exists'})
                res.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    password2,
                    req
                })
            }else{
                //create new user
                const newUser = new User({
                    name,
                    email,
                    password,
                })
                console.log(newUser)
                //hash password
                bCrypt.genSalt(10, (err, salt) => {
                    if(err) throw err;
                    bCrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        newUser.password = hash

                        //save user to db
                        newUser.save()
                        .then(user => {
                            req.flash('success_msg', 'registered successfully')
                            res.redirect('/users/login')
                        })
                        .catch(err => console.log(err))
                    })
                })



            }
        })
    }
})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
})

router.get('/logout', (req, res) => {
    req.logOut()
    req.flash('success_msg', 'successfully logout')
    res.redirect('/users/login')
})

module.exports = router