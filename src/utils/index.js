'use strict'

const _ = require('lodash')
const { BadRequestError } = require('../core/error.response')
const { Types } = require('mongoose')
const nodemailer = require('nodemailer')

const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields)
}

// ['a','b'] => {a:1,b:1}
const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 1]))
}

// ['a','b'] => {a:0,b:0}
const unGetSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 0]))
}

const removeUndefinedObject = (obj) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] == null) {
      delete obj[key]
    }
  })

  return obj
}

const updateNestedObjectParser = (obj) => {
  const final = {}
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      const response = updateNestedObjectParser(obj[key])
      Object.keys(response).forEach((key2) => {
        final[`${key}.${key2}`] = response[key2]
      })
    } else {
      final[key] = obj[key]
    }
  })
  return final
}

const isValidObjectId = (id) => {
  return Types.ObjectId.isValid(id)
}

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'alex01021999sandra@gmail.com',
    pass: 'fvsecuaajhmickyi'
  }
})

// // async..await is not allowed in global scope, must use a wrapper
// const sendEmail = async ({ email, resetToken }) => {
//   // send mail with defined transport object
//   const info = await transporter.sendMail({
//     from: 'alex01021999sandra@gmail.com', // sender address
//     to: email, // list of receivers
//     subject: 'Hello ✔', // Subject line
//     text: 'Hello world?', // plain text body
//     html: `<p>To reset your password, <a href="http://35.240.237.63:3000/reset-password/${resetToken}/${email}> Click here </a> </p>` // html body
//   })

//   console.log('Message sent: %s', info.messageId)
//   // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

//   //
//   // NOTE: You can go to https://forwardemail.net/my-account/emails to see your email delivery status and preview
//   //       Or you can use the "preview-email" npm package to preview emails locally in browsers and iOS Simulator
//   //       <https://github.com/forwardemail/preview-email>
//   //
// }

const sendEmail = async ({ email, resetToken, userType }) => {
  // Create the email content based on user type
  let htmlContent;
  if (userType === 'farm') {
    htmlContent = `<p>Click vào link sau: <a href="https://agritech-fe-urw9.onrender.com/reset-password/${resetToken}/${email}">Click here</a></p>`;
  } else if (userType === 'client') {
    htmlContent = `<p>Nếu là người tiêu dùng thì copy đoạn token sau: <strong>${resetToken}</strong></p>`;
  } else {
    throw new Error('Invalid user type');
  }

  // Send mail with defined transport object
  const info = await transporter.sendMail({
    from: 'alex01021999sandra@gmail.com', // sender address
    to: email, // list of receivers
    subject: 'Password Reset', // Subject line
    text: 'Please see the HTML content of this email.', // plain text body
    html: htmlContent // html body
  });

  // console.log('Message sent: %s', info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
};

module.exports = {
  getInfoData,
  getSelectData,
  unGetSelectData,
  removeUndefinedObject,
  updateNestedObjectParser,
  isValidObjectId,
  sendEmail
}
