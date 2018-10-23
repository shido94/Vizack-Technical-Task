const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary');
const axios = require('axios');
const fs = require('fs');
const saltRounds = 15;
const jwt = require('jsonwebtoken');
const async = require('async');
mongoose.Promise = Promise;
const process = require('../../keys/jwt');
const config = require('../../keys/cloudinary_keys');
const Admin = require('../model/registration');
const Branch = require('../model/branch');
const WaitForApproval = require('../model/wait-for-approval');
const Document = require('../model/document');
const User = require('../model/registration');

var PDFParser = require('pdf2json');
var pdfParser = new PDFParser();
// const getPageCount = require('docx-pdf-pagecount');

// const admin = {
//   name: 'Rupesh yadav',
//   email: 'rupeshyadav94.ry@gmail.com',
//   password: 'Rupesh94$',
//   role: 'admin',
//   Profession: { type: 'student', default: 'student' },
//   college: 'KIET'
// };

router.post('/verify', (req,res) =>{
  const secret_number = '8953048565';
  const value = req.body;

  if(secret_number === value.number) {
    return res.status(200).json({
      success: true
    })
  }
  else{
    return res.status(404).json({
      success: false,
      message: 'Wrong Credential'
    })
  }
});

router.post('/register', (req,res) =>{
  const adminForm = req.body;
  if (adminForm.password === adminForm.conf_password){

    bcrypt.hash(adminForm.password, saltRounds, (err,hash) =>{
      const admin = new Admin({
        name: adminForm.username,
        email: adminForm.email,
        role: 'admin',
        Profession: adminForm.profession,
        college: adminForm.college,
        password: hash,
      });

      admin.save((err, result)=>{
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
  const admin = req.body;

  const hash = await Admin.findOne({email: admin.email});

  if (hash) {
    bcrypt.compare(admin.password, hash.password, (err,result) =>{
      if (!result && hash.role !== 'admin/data' ) {
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
          username: hash.name,
          admin: hash.role
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

cloudinary.config({
  cloud_name: config.cloudName,
  api_key:    config.apiKey,
  api_secret: config.apiSecret
});

router.post('/branch-data', async (req,res) =>{
  const body = req.body;

  const branch = await Branch.findOne({branch_name: body.branch_name});
  console.log(branch);
  let base64Data = body.branchImg;

  if(base64Data !== null && branch === null) {
    base64Data = base64Data.replace(/^data:image\/jpeg;base64,/, '');
    base64Data = base64Data.replace(/^data:image\/png;base64,/, '');

    fs.writeFile("out.jpg", base64Data, 'base64', function (err) {
      cloudinary.uploader.upload("out.jpg", function (result) {
        if (result.url) {
          console.log(result);
          const data = {
            branchImg: result.url,
            branch_name: body.branch_name,
            semester_name: [{
              semester: body.semester,
              subject: body.subject
            }]
          };
          const new_branch = new Branch(data);
          new_branch.save((error) =>{
            if(!error){
              return res.status(200).json({
                success: true
              });
            }
          });
        }
        else {
          return res.status(404).json({
            success: false,
            message: 'Error in cloudinary API'
          })
        }
      })
    });
  }
  else {
    const data = {
      branch_name: body.branch_name,
      semester_name: [{
        semester: body.semester,
        subject: body.subject
      }]
    };
    if(branch) {
      let value = false;
      branch.semester_name.forEach((semester) => {
        if (semester.semester === data.semester_name[0].semester) {
          return value = true;
        }
      });
      if(value){
        return res.status(404).json({
          success: false,
          message: 'Data already exist'
        });
      }
      else{
        Branch.update({_id: branch._id},{
          $push: {
            semester_name: data.semester_name
          }
        },(err) => {
          if(err) {
            return res.status(404).json({
              success: false,
              message: 'Some error'
            });
          }
          else{
            return res.status(200).json({
              success: true
            });
          }
        });
      }
    }
  }
});


router.post('/approval', async (req,res) => {
  console.log(req.body);
  const dataId = req.body.approveData;
  const data = await WaitForApproval.findOne({_id: dataId});
  if(data) {
    const document = {
      uploadedBy: data.uploadedBy,
      types: data.types,
      branch: data.branch,
      course: data.course,
      university: data.university,
      doc_of_college: data.doc_of_college,
      document: data.document,
      semester: data.semester,
      subject: data.subject,
      unit_covered: data.unit_covered,
      uploadedAt: data.uploadedAt
    };
    const userData = new Document(document);

    userData.save( (err,output) => {
      if(!err) {
        User.update({_id: data.uploadedBy}, {
          $push: {
            uploads: output._id
          }
        }, (error) => {
          if(!error) {
            WaitForApproval.findByIdAndRemove(dataId, (err,data) => {
              if(!err){
                res.status(200).json({
                  success: true,
                  message: 'Successfully Approved'
                });
              }
              else{
                console.log(err);
                throw err;
              }
            });
          }
          else{
            res.status(404).json({
              success: false,
              message: 'Approval Failed'
            });
          }
        });
      }else{
        console.log(err);
        throw err;
      }
    });
  }
  else{
    res.status(404).json({
      success: false,
      message: 'This data is already handeled'
    });
  }
});

router.post('/disapproval', async (req,res,next) => {
  console.log(req.body);
  const rejected = req.body.disapproveData;

  const userId = WaitForApproval.findOne({_id: rejected.docs});

  const notification = {
      subject: {type: String},
      message: {type: String},
      documentId: {type: String}
  };

  User.update({_id: userId.uploadedBy}, {
    $push: {
      notifications: notification
    }
  }, (err,result) => {
    if(err){
      next(err);
    }
    else{
      res.status(200).json({
        success: true,
        message: 'Your message is successfully send to the user'
      });
    }
  });

});

router.get('/branch-list', async (req,res) => {
  const branch = [];
  Branch.find({}, 'branchImg branch_name', (err, output) => {
    if (output) {
      output.forEach(output => {
        branch.push(output);
      });
      res.status(200).json(branch);
    }
  });
});

router.post('/semester', (req,res) => {
  const sem = [];
  Branch.findOne({branch_name: req.body.branch}, (err,result) => {
    if(result){

      result.semester_name.forEach(semester => {
        sem.unshift(semester.semester);
      });
      sem.sort(function(a,b) {
        if (isNaN(a) || isNaN(b)) {
          return a > b ? 1 : -1;
        }
        return a - b;
      });
      res.status(200).json(sem);
    }
  })
});

router.post('/subject', (req,res) => {
  const array = [];
  const subject_arr = [];
  Branch.findOne({branch_name: req.body.branch}, (err, result) => {
    if (result) {
      result.semester_name.forEach(semester => {
        if(semester.semester === req.body.sem) {
          array.push(semester);
          return;
        }
      });

      array[0].subject.forEach(sub => {
        subject_arr.push(sub);
      });
      console.log(subject_arr);
      res.status(200).json(subject_arr);
    }
  })
});

router.get('/pending-data', async (req,res) => {
  const pendingData = [];

  async.waterfall([
    function (callback) {
      WaitForApproval.find({}, (err,result) => {
        callback(null,result);
      });
    },
    function (result, callback) {
      result.forEach(data => {
        User.findOne({_id: data.uploadedBy}, (err,name) => {
          let total = {
            id: data._id,
            name: name.name,
            subject: data.subject,
            uploadOn: data.uploadedAt
          };
          pendingData.push(total);
          if (pendingData.length === result.length)
            callback(null, pendingData);
          // callback(null,pendingData);
        });
      });
    }
  ], function () {
      // console.log(pendingData);
      res.status(200).json(pendingData);
  });

  // let findOneFunctions = result.map(e=>function(cb){User.findOne({},..cb(err,data))}
  //
  // async.waterfall([
  //   function (callback) {
  //     WaitForApproval.find({}, (err,result) => {
  //       callback(null,result);
  //     });
  //   },
  //   function (callback) {
  //     async.parallel(findOneFunctions,function(err,data){
  //       callback(null,data);
  //     });
  //   }
  // ], function (err,result) {
  //   // result[0] will be from waitForApproval, result[1] will be from findOneFunctions
  //   console.log(result);
  // });

});

router.post('/data', (req,res) => {
  const dataId = req.body.data;

  WaitForApproval.findOne({_id: dataId},'-uploadedBy -uploadedAt')
    .then(result => {
      res.status(200).json(result)
    })
    .catch(error => {
      console.log(error);
      throw error;
    });
});

router.post('/data-details', (req,res) => {
  const array = [];
  Document.find({semester: req.body.sem, subject: req.body.subject})
    .then(result => {
      result.forEach(value => {
        User.findOne({_id: value.uploadedBy})
          .then(user => {
            value.uploadedBy = user.name;
            array.push(value);
            // getPageCount(value.document)
            //   .then(pages => {
            //     console.log(pages);
            //   });

            // pdfParser.on('pdfParser_dataError', _.bind(_onPFBinDataError, self));
            console.log(value.document);
            pdfParser.loadPDF(value.document);
            pdfParser.on('pdfParser_dataReady', function(data) {
              const doc = data.PDFJS && data.PDFJS.pdfDocument && data.PDFJS.pdfDocument.numPages;
              console.log('Number of pages:', doc);
            });

            if(array.length === result.length){
              res.status(200).json(array);
            }
          })
          .catch(error => {
            console.log(error);
            throw error;
          })
      });
    })
    .catch(error => {
      throw error;
    })
});

module.exports = router;
