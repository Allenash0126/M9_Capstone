const bcrypt = require('bcryptjs')
const { User, Class } = require('../models')

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
        req.flash('success_msg', '註冊成功！')
        return res.redirect('/signin')
      })
      .catch(err => next(err))
  },
  signInPage: (req, res, next) => {   
    return res.render('signin')
  },
  signIn: (req, res, next) => {   
    req.flash('success_msg', '成功登入！')
    return res.redirect('/classes')    
  },
  logout: (req, res, next) => {   
    req.flash('success_msg', '成功登出！')
    req.logout()
    return res.redirect('/signin')        
  },
  signUpPageTeacher: (req, res, next) => {   
    const classData = {}
    classData.classDay = 'no data yet' // 為了避免在 handlebar-helpers 的 indexOf 讀不到值而出現錯誤，所以先給空值
    return res.render('teacher/signup', { class: classData })
  },
  signUpTeacher: (req, res, next) => {   
    const teacherId = req.user.id
    const { intro, style, link, classDay, classDuration, nation } = req.body

    return Promise.all([
      User.findByPk(teacherId),
      Class.findOne({ where: { teacherId } })
    ])
      .then(([user, classData]) => {
        if(!user) throw new Error('There is no such user :(')
        if(classData) throw new Error('You have been already a teacher')
        user.update({ isTeacher: 1 })        
        Class.create({ 
          intro, style, link, classDay, teacherId, classDuration, nation,
          teacherName: user.toJSON().name 
        })
        req.flash('success_msg', '新增成功')
        return res.redirect('/teacher/profile')        
      })
      .catch(err => next(err))      
  }
}

module.exports = userController