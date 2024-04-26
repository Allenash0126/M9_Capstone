const express = require('express')
const router = express.Router()
const adminController = require('../../controllers/admin-controller')

router.get('/timelist', adminController.getTimeList)

router.use('/', (req, res) => res.redirect('/admin/timelist'))

module.exports = router