const express = require('express')
const router = express.Router()

const classController = require('../controllers/class-controller')
const userController = require('../controllers/user-controller')
const { generalErrorHandler } = require('../middleware/error-handler')
const teacher = require('./module/teacher')
const passport = require('passport')
const { authenticated } = require('../middleware/auth')

router.use('/teacher', teacher)
router.get('/signup/forteacher', authenticated, userController.signUpPageTeacher)
router.post('/signup/forteacher', authenticated, userController.signUpTeacher)
router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
router.get('/logout', userController.logout)
router.get('/classes', authenticated, classController.getClasses)

router.use('/', (req, res) => res.redirect('/classes'))
router.use('/', generalErrorHandler)

module.exports = router 
