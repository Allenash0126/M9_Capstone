const express = require('express');
const { engine } = require('express-handlebars')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('./config/passport')
const app = express();
const routes = require('./routes')
const port = 3000;
const SESSION_SECRET = 'secret'

app.engine('.hbs', engine({extname: '.hbs'}))
app.set('view engine', '.hbs')
app.set('views', './views')
// app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_msg')
  res.locals.error_messages = req.flash('error_msg')
  next()
})

app.use(routes)

app.listen(port,() => {
  console.log(`It is running on server http://localhost:${port}`)
})

module.exports = app 