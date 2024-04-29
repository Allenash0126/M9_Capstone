const { User, Class, Record, List } = require('../models')
const { localFileHandler } = require('../helpers/file-helpers')

const teacherController = {
  getProfile: (req, res, next) => {
    const { id } = req.user
    return Promise.all([
      User.findByPk(id), 
      Class.findOne({ where: { teacherId: id } })
    ])
      .then(([user, classData]) => {
        if(!user) throw new Error('There is no such user :(')
        if(!classData) throw new Error(`You haven't filled in any info in 成為老師 form`)
        return res.render('teacher/profile', { 
          user: user.toJSON(),
          class: classData.toJSON()
        })
      })
      .catch(err => next(err))
  },
  editProfile: (req, res) => {
    const { id } = req.params
    return Class.findOne({ 
      where: { teacherId: id },
      raw: true
    })
      .then(classData => {
        if(!classData) throw new Error('Class data did not exist.')
        return res.render('teacher/edit-profile', { class: classData })
      })

  },
  putProfile: (req, res, next) => {
    // 這個 button按下去 就會自動建立對應的records
    // 利用 迴圈建立
    // 目前 先抓出list 對應的陣列（可上課區間） ==> 可以再用Length() 抓出數量（總共幾個時段）
    // 抓出數量 可以用在迴圈 i = 0; i < length; i++

    const teacherId = req.user.id
    const { intro, style, link, classDay, duration30or60, nation, teacherName } = req.body
    const { file } = req

    return Promise.all([
      User.findByPk(teacherId),
      Class.findOne({ where: { teacherId } }),
      localFileHandler(file),
      List.findAll({ where: { duration30or60 }, raw: true })
    ])
      .then(([user, classData, filePath, lists]) => {
        if(!user) throw new Error('There is no such user :(')
        if(!classData) throw new Error('You are not a teacher now. Please sign up for 成為老師') 
        const classNumberInOneDay = lists.length // 每天可約的時段數量有幾個
        const classAvailable = lists.map(list => list.timeList) // 每天可預約的時段有哪些

        classData.update({ 
          intro, style, link, classDay, teacherId, duration30or60, nation, teacherName, 
          image: filePath || classData.image 
        })
        user.update({ 
          nation, intro,           
          name: teacherName, 
          image: filePath || classData.image
        })
        // Record.create({

        // })
        req.flash('success_msg', '更新成功')
        return res.redirect('/teacher/profile')        
      })
      .catch(err => next(err))     
  },
  signUpPage: (req, res) => {
    return res.render('teacher/signup')
  }
}

module.exports = teacherController