const express = require('express')
const router = express.Router()

const upload = require('../middleware/multer')
const classController = require('../controllers/class-controller')
const userController = require('../controllers/user-controller')
const { generalErrorHandler } = require('../middleware/error-handler')
const admin = require('./module/admin')
const teacher = require('./module/teacher')
const passport = require('passport')
const { authenticated, authenticatedTeacher, authenticatedAdmin } = require('../middleware/auth')

router.use('/admin', authenticatedAdmin, admin)
router.use('/teacher', authenticatedTeacher, teacher)
router.get('/signup/forteacher', authenticated, userController.signUpPageTeacher)
router.post('/signup/forteacher', upload.single('image'), authenticated, userController.signUpTeacher)
router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
router.get('/logout', userController.logout)

router.get('/users/profile/:id/edit', authenticated, userController.editProfile)
router.get('/users/:id/profile', authenticated, userController.getProfile)
router.put('/users/:id/profile', upload.single('image'), authenticated, userController.putProfile)

router.get('/classes/:id/comment', authenticated, classController.getComment)
router.post('/classes/:id/comment', authenticated, classController.postComment)

router.get('/classes/:id', authenticated, classController.getClass)
router.get('/classes', authenticated, classController.getClasses)

router.use('/', (req, res) => res.redirect('/classes'))
router.use('/', generalErrorHandler)

module.exports = router 
