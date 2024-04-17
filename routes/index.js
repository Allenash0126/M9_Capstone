const express = require('express')
const router = express.Router()

const classController = require('../controllers/class-controller')
const userController = require('../controllers/user-controller')
const { generalErrorHandler } = require('../middleware/error-handler')
const teacher = require('./module/teacher')

router.use('/teacher', teacher)
router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/signin', userController.signInPage)
router.get('/classes', classController.getClasses)

router.use('/', (req, res) => res.redirect('/classes'))
router.use('/', generalErrorHandler)

module.exports = router 
