const express = require('express')
const router = express.Router()
const teacherController = require('../../controllers/teacher-controller')

router.get('/profile', teacherController.getProfile)
router.use('/', (req, res) => res.redirect('/teacher/profile'))

module.exports = router