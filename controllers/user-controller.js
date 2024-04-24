const bcrypt = require('bcryptjs')
const { User, Class } = require('../models')
const { localFileHandler } = require('../helpers/file-helpers')

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
    const { file } = req

    return Promise.all([
      User.findByPk(teacherId),
      Class.findOne({ where: { teacherId } }),
      localFileHandler(file)
    ])
      .then(([user, classData, filePath]) => {
        if(!user) throw new Error('There is no such user :(')
        if(classData) throw new Error('You have been already a teacher')
        user.update({ 
          isTeacher: 1,
          image: filePath || null, 
          intro,
          nation
        })        
        Class.create({ 
          intro, style, link, classDay, teacherId, classDuration, nation,
          teacherName: user.toJSON().name,
          image: filePath || null
        })
        req.flash('success_msg', '新增成功')
        return res.redirect('/teacher/profile')        
      })
      .catch(err => next(err))      
  },
  getProfile: (req, res, next) => {
    const { id } = req.params
    return Promise.all([
      User.findByPk(id, { raw: true }),
      Class.findOne({ where: { teacherId: id }, raw: true })
    ])
      .then(([user, classData]) => {
        res.render('profile', { user, class: classData })
      })
      .catch(err => next(err))
  },
  editProfile: (req, res, next) => {
    const { id } = req.params
    return User.findByPk(id, { raw: true })
      .then(user => res.render('edit-profile', { user }))
      .catch(err => next(err))
  },
  putProfile: (req, res, next) => {
    const { id } = req.user
    const { intro, nation, name } = req.body

    return User.findByPk(id)
      .then(user => {
        if(!user) throw new Error('There is no such user :(')
        user.update({ name, nation, intro })
        req.flash('success_msg', '更新成功')
        return res.redirect(`/users/${id}/profile`)        
      })
      .catch(err => next(err))         
  }  
}

module.exports = userController