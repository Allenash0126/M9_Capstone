const bcrypt = require('bcryptjs')
const { User } = require('../models')

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  }, 
  signUp: (req, res, next) => {    
    const { name, email, password, passwordCheck } = req.body
    // if (password !== passwordCheck) throw new Error('兩次密碼必須相同')
    // 另外需再確認該信箱沒有被註冊過
    return bcrypt.hash(password, 10)
      .then(hash => User.create({
        password: hash,
        name,
        email
      }))
      .then(() => {
        // 加入成功通知
        res.redirect('/signin')
      })
      .catch(err => next(err))
  },
  signInPage: (req, res, next) => {   
    return res.render('signin')
  }
  
}

module.exports = userController