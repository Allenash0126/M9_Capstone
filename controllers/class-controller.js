const { Class, User } = require('../models')

const classController = {
  getClasses: (req, res, next) => {
    return Class.findAll({
      raw: true
    })
      .then(classes => res.render('classes', { classes }))
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
  }
}

module.exports = classController