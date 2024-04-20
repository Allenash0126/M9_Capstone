const teacherController = {
  getProfile: (req, res) => {
    return res.render('teacher/profile')
  },
  signUpPage: (req, res) => {
    console.log('ready for signUpPage~~~~~~~~~')
    return res.render('teacher/signup')
  }  
}

module.exports = teacherController