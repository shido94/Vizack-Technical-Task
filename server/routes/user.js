const express = require('express');


const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary');
const saltRounds = 15;
const jwt = require('jsonwebtoken');
mongoose.Promise = Promise;
const User = require('../model/registration');
const process = require('../../keys/jwt');
const config = require('../../keys/cloudinary_keys');
const multer = require('multer');
const storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, file.originalname)
  }
});
const imagefilter = function (req, file, cb) {
  if(!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
    return cb(new Error('only image files are accepted here'), false);
  }
  cb(null, true);
};
const upload = multer({ storage: storage, filterHack: imagefilter });

const Document = require('../model/document');
const Branch = require('../model/branch');

const WaitForApproval = require('../model/wait-for-approval');
const checkAuth = require('../middleware/check-auth');



router.post('/register', (req,res)=>{
  const userForm = req.body;

  if (userForm.password === userForm.conf_password){

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
          res.json({
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
});

router.post('/login', async (req,res)=>{
  const user = req.body;
  console.log(user);

  const hash = await User.findOne({email: user.email});

  if (hash) {
    bcrypt.compare(user.password, hash.password, (err,result) =>{
      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Wrong Credential'
        });
      }

      else {
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
          username: hash.name
        });
      }
    });
  }
  else{
    res.status(404).json({
      success: false,
      message: 'Wrong Credential'
    });
  }
});

router.post('/subjectSearch', (req,res) =>{

  // const value = req.body;
  // const store = [];
  // const regex = new RegExp(value, 'i');
  // User.find({name: regex}, (err,result) => {
  //   result.forEach(data => {
  //     store.push(data.name);
  //   });
  //   res.status(200).json({success: true, value: store});
  // });

  const array = [];
  const subject_arr = [];
  Branch.findOne({branch_name: req.body.branch}, (err, result) => {
    if (result) {
      result.semester_name.forEach(semester => {
        if(semester.semester === req.body.semester) {
          array.push(semester);
          return;
        }
      });

      array[0].subject.forEach(sub => {
        subject_arr.push(sub.subject_name);
      });
      res.status(200).json(subject_arr);
    }
  })

});

cloudinary.config({
  cloud_name: config.cloudName,
  api_key:    config.apiKey,
  api_secret: config.apiSecret
});

router.post('/upload', checkAuth,upload.single('photo'), (req,res, next) => {
  const body = req.file;

  console.log(body);

  cloudinary.v2.uploader.upload(body.path, (err, result) => {
    if (err) {
      console.log(err);
      next(err);
    }
    else {
      res.status(200).json({
        url: result.url,
        success: true
      });
    }
  });
});

router.post('/submit', checkAuth, (req,res) => {
  const file = req.body;
  let topics = [];

  if(file.topic_covered.length > 0) {
    file.topic_covered.forEach(topic => {
      topics.push(topic.topics);
    });
  }

  const document= {
    uploadedBy: req.userData.userId,
    types: file.types,
    branch: file.branch,
    course: file.course,
    university: file.university,
    doc_of_college: file.doc_of_college,
    document: file.document,
    semester: file.semester,
    subject: file.subject,
    unit_covered: topics
  };


  const docs = new WaitForApproval(document);

  docs.save( (err,ouptput) => {
    if(err) {
      next(err)
    }
    else{
      res.status(200).json({
        success: true,
        message: 'You file has been successfully '
      })
    }
  });
});


module.exports = router;
