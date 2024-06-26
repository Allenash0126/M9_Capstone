const path = require('path')
const express = require('express');
const { engine } = require('express-handlebars')
const flash = require('connect-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const passport = require('./config/passport')
const handlebarsHelpers = require('./helpers/handlebars-helpers')
const { getUser } = require('./helpers/auth-helpers')
const app = express();
const routes = require('./routes')
const port = 3000;
// const SESSION_SECRET = 'secret'

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config()
}

app.engine('.hbs', engine({extname: '.hbs', helpers: handlebarsHelpers}))
app.set('view engine', '.hbs')
app.set('views', './views')
// app.use(express.static('public'))
app.use(express.urlencoded({ extended: true })) // 可在post拿到值 from form
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use(methodOverride('_method'))
app.use('/upload', express.static(path.join(__dirname, 'upload')))
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_msg')
  res.locals.error_messages = req.flash('error_msg')
  res.locals.warning_messages = req.flash('warning_msg')
  res.locals.user = getUser(req)
  next()
})

app.use(routes)

app.listen(port,() => {
  console.log(`It is running on server http://localhost:${port}`)
})

module.exports = app 