const teacherController = {
  getProfile: (req, res) => {
    return res.render('teacher/profile')
  },
  signUpPage: (req, res) => {
    return res.render('teacher/signup')
  }
}

module.exports = teacherController