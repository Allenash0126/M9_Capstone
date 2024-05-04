const { Class, User, Record } = require('../models')

const classController = {
  getClasses: (req, res, next) => {
    return Class.findAll({
      raw: true
    })
      .then(classes => res.render('classes', { classes }))
      .catch(err => next(err))
  },
  getClass: (req, res, next) => {
    const { id } = req.params
    return Promise.all([
      Class.findByPk(id, { raw: true }),
      Record.findAll({ 
        where: { classId: id },
        raw: true
      })
    ])
      .then(([classData, records]) => {
        records = records.filter(record => !record.studentId)
        res.render('class', { class: classData, records }
      )})
      .catch(err => next(err))
  },  
  getComment: (req, res, next) => {
    const { id } = req.params
    return User.findByPk(id, { raw: true })
      .then(user => res.render('comment', { user }))
      .catch(err => next(err))
  },
  postComment: (req, res, next) => {
    
    console.log('post it successfully. Wait for DB records')
  },
  postRecord: (req, res, next) => {
    const { selectedTiming } = req.body
    const studentId = req.user.id
    const isTeacher = req.user.isTeacher
    const { id } = req.params
    const split = selectedTiming.split(',')
    const timeListId = split[0]
    const date = split[1]

    if (isTeacher) {
      return  req.flash('success_msg', '您是老師, 沒有預約課程的權限 : ( ')
    }
    return Promise.all([
      Class.findByPk(id, { raw: true }),
      Record.findOne({ where: { date, timeListId } })
    ])
      .then(([classData, record]) => {
        record.update({ studentId })
        if (record.studentId) {
          res.render('class', { bookingSuccess: classData, class: classData, record: record.toJSON() })
        } else {
          res.render('class', { bookingFailed: classData, class: classData, record: record.toJSON() })
        }
      })
      .catch(err => next(err))
  }
}

module.exports = classController