const express = require('express')
const router = express.Router()

const classController = require('../controllers/class-controller')
const teacher = require('./module/teacher')

router.use('/teacher', teacher)
router.get('/classes', classController.getClasses)

router.use('/', (req, res) => res.redirect('/classes'))

module.exports = router 
