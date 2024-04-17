const { Class } = require('../models')

const classController = {
  getClasses: (req, res) => {
    return res.render('classes')
  // return Class.findAll()
  //   .then(classes => res.send({ classes }))
  //   .catch(err => res.status(422).json(err))    
  }
}

module.exports = classController