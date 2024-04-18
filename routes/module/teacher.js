const express = require('express')
const router = express.Router()
const teacherController = require('../../controllers/teacher-controller')
const { authenticatedTeacher } = require('../../middleware/auth')

router.get('/profile', authenticatedTeacher, teacherController.getProfile)
router.use('/', (req, res) => res.redirect('/teacher/profile'))

module.exports = router