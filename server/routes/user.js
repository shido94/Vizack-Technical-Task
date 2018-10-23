const express = require('express');


const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 15;
const jwt = require('jsonwebtoken');
mongoose.Promise = Promise;
const User = require('../model/registration');
const process = require('../../keys/jwt');

const checkAuth = require('../middleware/check-auth');


router.post('/register', (req,res)=>{
  const userForm = req.body;

  // check for password
  if (userForm.password === userForm.conf_password){
    // encrypt the password
    bcrypt.hash(userForm.password, saltRounds, (err,hash) =>{
      const user = new User({
        name: userForm.username,
        email: userForm.email,
        Profession: userForm.profession,
        password: hash,
        college: userForm.college
      });

      user.save((err, result)=>{
        if(err){
          return res.status(404).json({
            success: false,
            message: 'Incorrect Details'
          });
        }
        else {
          res.json({
            success: true
          });
        }
      });
    });
  }
  else{
    return res.status(404).json({
      success: false,
      message: 'Password not matches'
    });
  }
});

router.post('/login', async (req,res)=>{
  const user = req.body;

  // check for admin
  if(user.username === 'admin' && user.password === 'admin') {
    const token = jwt.sign({
        username: 'admin'
      }, process.env.JWT_KEYS ,
      {
        expiresIn: "1 days"
      });
    res.status(200).json({
      success: true,
      token: token,
      role: 'admin'
    });
  }
  else{

    // check for user
    const hash = await User.findOne({name: user.username});

    if (hash) {
      bcrypt.compare(user.password, hash.password, (err,result) =>{
        if (!result) {
          res.status(404).json({
            success: false,
            message: 'Wrong Email or Password'
          });
        }

        else {

          // create token
          const token = jwt.sign({
              email: hash.email,
              userId: hash._id
            }, process.env.JWT_KEYS ,
            {
              expiresIn: "1 days"
            });
          res.status(200).json({
            success: true,
            token: token,
            username: hash.name,
            role: 'user'
          });
        }
      });
    }
    else{
      res.status(404).json({
        success: false,
        message: 'Wrong Email or Password'
      });
    }
  }
});

router.get('/data', checkAuth, (req,res) => {

  // send data to user as show in their profile
  User.findOne({_id: req.userData.userId}, '-password -__v -role -_id')
    .then(user => {
      return res.status(200).json({
        success: true,
        user: user
      })
    })
    .catch(error => {
      console.log(error);
      throw new error;
    });
});



module.exports = router;
