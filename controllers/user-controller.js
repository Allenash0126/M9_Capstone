const bcrypt = require('bcryptjs')
const dayjs = require('dayjs');
const { User, Class, List, Record } = require('../models')
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
    if (req.user.email === 'root@example.com') return res.redirect('/admin/timelist')
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
    const { intro, style, link, classDay, duration30or60, nation } = req.body
    const { file } = req

    // 老師可以上課的所有日期 dates
    const dates = [] 
    let currentDate = dayjs() // 獲取當前日期
    for (let i = 0; i < 14; i++) {
      if (classDay.some(day => parseInt(day) === currentDate.day())) {
        const formattedDate = currentDate.format('YYYY-MM-DD dddd')
        dates.push(formattedDate);
      }
      currentDate = currentDate.add(1, 'day')
    }  

    return Promise.all([
      User.findByPk(teacherId),
      Class.findOne({ where: { teacherId } }),
      localFileHandler(file),
      List.findAll({ where: { duration30or60 }, raw: true }),
      Class.findAll({ raw: true })
    ])
      .then(([user, classData, filePath, lists, classesDatas]) => {
        if(!user) throw new Error('There is no such user :(')
        if(classData) throw new Error('You have been already a teacher')
        const classNumberInOneDay = lists.length // 每天可約的時段數量有幾個
        
        user.update({ 
          isTeacher: 1,
          image: filePath || null, 
          intro,
          nation
        })        
        Class.create({ 
          intro, style, link, classDay, teacherId, duration30or60, nation,
          teacherName: user.toJSON().name,
          image: filePath || null
        })

        for (let i = 0; i < classDay.length; i++ ) {
          for (let j = 0; j < classNumberInOneDay; j++ ) {
            let chosenOclock = lists.filter(list => list.oclock === lists[j].oclock)
            let timeListId = chosenOclock[0].id            
            Record.create({
              teacherId,
              timeListId,
              date: dates[i],
              oclock: lists[j].oclock,
              classId: classesDatas.length + 1
            })
          }
        }   
      })
      .then(() => {
        req.flash('success_msg', '歡迎成為老師！')
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
    const { file } = req

    return Promise.all([
      User.findByPk(id),
      localFileHandler(file)
    ])
      .then(([user, filePath]) => {
        if(!user) throw new Error('There is no such user :(')   
        user.update({ 
          name, nation, intro,
          image: filePath || user.image
        })
        req.flash('success_msg', '更新成功')
        return res.redirect(`/users/${id}/profile`)        
      })
      .catch(err => next(err))         
  }  
}

module.exports = userController