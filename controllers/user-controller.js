const bcrypt = require('bcryptjs')
const { User } = require('../models')

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  }, 
  signUp: (req, res, next) => {    
    const { name, email, password, passwordCheck } = req.body
    if (password !== passwordCheck) throw new Error('兩次密碼必須相同')
    return User.findOne({ where: { email } })
      .then(user => {
        if(user) throw new Error('此email已經註冊')
        return bcrypt.hash(password, 10)
      })
      .then(hash => User.create({ password: hash, name, email }))
      .then(() => {
        req.flash('success_msg','註冊成功！')
        return res.redirect('/signin')
      })
      .catch(err => next(err))
  },
  signInPage: (req, res, next) => {   
    return res.render('signin')
  }
  
}

module.exports = userController