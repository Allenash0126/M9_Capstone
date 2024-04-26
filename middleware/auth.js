const { ensureAuthenticated, getUser } = require('../helpers/auth-helpers')
const adminEmail = 'root@example.com'

const authenticated = (req, res, next) => {
  if (ensureAuthenticated(req)) {
    if (getUser(req).email !== adminEmail) {
      return next()
    }
    return res.redirect('/admin')
  }
  return res.redirect('/signin')
}

const authenticatedTeacher = (req, res, next) =>{
  if (ensureAuthenticated(req)) {
    if (getUser(req).email !== adminEmail) {
      if (getUser(req).isTeacher) {
        return next()
      }
      return res.redirect('/admin')
    }
    return res.redirect('/')
  } 
  return res.redirect('/signin')
}

const authenticatedAdmin = (req, res, next) =>{
  if (ensureAuthenticated(req)) {
    if (getUser(req).email === adminEmail) {
      return next()
    }
    return res.redirect('/')
  }
  return res.redirect('/signin')
}

module.exports = {
  authenticated, 
  authenticatedTeacher,
  authenticatedAdmin
}