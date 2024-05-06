const { Class, User, Record } = require('../models')
const dayjs = require('dayjs');

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
    return Record.findByPk(id, { 
      include: [Class],
      raw: true,
      nest: true
    })
      .then(record => {
        if(!record) throw new Error('There is no such record')
        if (record.studentId !== req.user.id) throw new Error('You can comment your teacher only')
        res.render('comment', { record })
      })
      .catch(err => next(err))
  },
  postComment: (req, res, next) => {
    const { comment, score } = req.body
    const { id } = req.params
    return Promise.all([
      Record.findByPk(id),
      Record.findByPk(id, { 
        include: [Class],
        raw: true,
        nest: true
      })
    ])
      .then(([record1, record2]) => {
        if(!record2) throw new Error('There is no such record')
        if (record2.studentId !== req.user.id) throw new Error('You can comment your teacher only')
        return record1.update({ comment, score })        
      })
      .then(record1 => {
        req.flash('succes_msg', 'Commented successfully')
        return res.redirect(`/users/${record1.studentId}/profile`)
      })
      .catch(err => next(err))
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