const express = require('express')
const router = express.Router()
const teacherController = require('../../controllers/teacher-controller')
const upload = require('../../middleware/multer')

router.get('/profile/:id/edit', teacherController.editProfile)
router.put('/profile/:id', upload.single('image'), teacherController.putProfile)
router.get('/profile', teacherController.getProfile)
router.use('/', (req, res) => res.redirect('/teacher/profile'))

module.exports = router