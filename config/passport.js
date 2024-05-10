const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcryptjs')
const { User } = require('../models')
const FacebookStrategy = require('passport-facebook')
if (process.env.NODE_ENV === 'development') {
  require('dotenv').config()
}

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, 
  (req, email, password, cb) => {
    User.findOne({ where: { email } })
      .then(user => {
        if (!user) return cb(null, false, req.flash('error_msg', '帳號或密碼錯誤:('))
        return bcrypt.compare(password, user.password)
          .then(res => {
            if(!res) return cb(null, false, req.flash('error_msg', '帳號或密碼錯誤:('))
            return cb(null, user)
          })
      }) 
  }
))

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET, 
  callbackURL: process.env.FACEBOOK_CLIENT_CALLBACK_URL,
  profileFields: ['email', 'displayName']
}, (accessToken, refreshToken, profile, done) => {
  const email = profile.emails[0].value
  const name = profile.displayName

  return User.findOne({
    attributes: ['id', 'name', 'email'],
    where: { email },
    raw: true
  })
    .then((user) => {
      if(user) return done(null, user)

      const randomPwd = Math.random().toString(36).slice(-8)

      return bcrypt.hash(randomPwd, 10) 
        .then((hash) => User.create({ name, email, password:hash }))
        .then((user) => done(null, {id: user.id, name: user.name, email: user.email}))
    })
    .catch((error) => done(error))
}))


passport.serializeUser((user, cb) => {
  cb(null, user.id)
})

passport.deserializeUser((id, cb) => {
  return User.findByPk(id)
    .then(user => cb(null, user.toJSON()))
})

module.exports = passport