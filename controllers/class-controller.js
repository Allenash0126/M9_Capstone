const { Class, User } = require('../models')

const classController = {
  getClasses: (req, res, next) => {
    return res.render('classes')
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