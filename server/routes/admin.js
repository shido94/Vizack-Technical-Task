const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs');
const saltRounds = 15;
const jwt = require('jsonwebtoken');
const async = require('async');
mongoose.Promise = Promise;
const process = require('../../keys/jwt');
const User = require('../model/registration');


// show list of user to admin
router.get('/admin', (req,res) => {
  User.find()
    .then(user => {
      return res.status(200).json({
        success: true,
        user: user
      });
    })
    .catch(error => {
      console.log(error);
      throw new error;
    })
});

// delete particular user
router.post('/deleteUser', (req,res) => {
  User.deleteOne({_id: req.body.id}, (err) => {
    if(!err) {
      return res.status(200).json({
        success: true
      });
    }
    else{
      console.log(err);
      throw new err
    }
  })
});

// update the data of particular user
router.post('/updateUser', (req,res) => {
  const data = req.body.data;
  User.updateOne({_id: data.id}, {
    $set: {
      name: data.name,
      email: data.email
    }
  }, (err,result) => {
    if(err){
      console.log(err);
      throw new err
    }
    else{
      return res.status(200).json({
        success: true
      });
    }
  });

});

// show data to be update by admin
router.get('/getdata', (req,res) => {
  const id = req.query.id;

  User.findOne({_id: id}, 'name email Profession')
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
