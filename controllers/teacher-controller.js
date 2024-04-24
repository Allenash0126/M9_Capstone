const { User, Class } = require('../models')

const teacherController = {
  getProfile: (req, res, next) => {
    const { id } = req.user
    return Promise.all([
      User.findByPk(id), 
      Class.findOne({ where: { teacherId: id } })
    ])
      .then(([user, classData]) => {
        if(!user) throw new Error('There is no such user :(')
        if(!classData) throw new Error(`You haven't filled in any info in 成為老師 form`)
        return res.render('teacher/profile', { 
          user: user.toJSON(),
          class: classData.toJSON()
        })
      })
      .catch(err => next(err))
  },
  editProfile: (req, res) => {
    const { id } = req.params
    return Class.findOne({ 
      where: { teacherId: id },
      raw: true
    })
      .then(classData => {
        if(!classData) throw new Error('Class data did not exist.')
        return res.render('teacher/edit-profile', { class: classData })
      })

  },
  putProfile: (req, res, next) => {
    const teacherId = req.user.id
    const { intro, style, link, classDay, classDuration, nation, teacherName } = req.body

    return Promise.all([
      User.findByPk(teacherId),
      Class.findOne({ where: { teacherId } })
    ])
      .then(([user, classData]) => {
        if(!user) throw new Error('There is no such user :(')
        if(!classData) throw new Error('You are not a teacher now. Please sign up for 成為老師') 
        classData.update({ intro, style, link, classDay, teacherId, classDuration, nation, teacherName })
        user.update({ name: teacherName, nation, intro })
        req.flash('success_msg', '更新成功')
        return res.redirect('/teacher/profile')        
      })
      .catch(err => next(err))     
  },
  signUpPage: (req, res) => {
    return res.render('teacher/signup')
  }
}

module.exports = teacherController