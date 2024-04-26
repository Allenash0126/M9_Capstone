const { User, Class, List } = require('../models')

const adminController = {
  getTimeList: (req, res, next) => {
    return res.render('admin/time-list')
  }
}

module.exports = adminController