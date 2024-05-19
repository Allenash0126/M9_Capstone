const bcrypt = require('bcryptjs')
const dayjs = require('dayjs');
const { User, Class, List, Record } = require('../models')
const { localFileHandler } = require('../helpers/file-helpers')
const { recordCreator } = require('../helpers/record-helpers')
const { newDatesCreator } = require('../helpers/record-helpers')
const Sequelize = require('sequelize');

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  }, 
  signUp: (req, res, next) => {    
    const { name, email, password, passwordCheck } = req.body
    if (password !== passwordCheck) throw new Error('兩次密碼必須相同')
    return User.findOne({ where: { email } })
      .then(user => {
        if(user) throw new Error('此email已經註冊')
        return bcrypt.hash(password, 10)
      })
      .then(hash => User.create({ password: hash, name, email }))
      .then(() => {
        req.flash('success_msg', '註冊成功！')
        return res.redirect('/signin')
      })
      .catch(err => next(err))
  },
  signInPage: (req, res, next) => {   
    return res.render('signin')
  },
  signIn: (req, res, next) => {   
    if (req.user.email === 'root@example.com') return res.redirect('/admin/timelist')
    req.flash('success_msg', '成功登入！')
    return res.redirect('/classes')    
  },
  logout: (req, res, next) => {   
    req.flash('success_msg', '成功登出！')
    req.logout()
    return res.redirect('/signin')        
  },
  signUpPageTeacher: (req, res, next) => {   
    const classData = {}
    classData.classDay = 'no data yet' // 為了避免在 handlebar-helpers 的 indexOf 讀不到值而出現錯誤，所以先給空值
    return res.render('teacher/signup', { class: classData })
  },
  signUpTeacher: (req, res, next) => {   
    const teacherId = req.user.id
    const { intro, style, link, duration30or60, nation } = req.body
    let { classDay } = req.body // 因為 classDay 是JSON檔, 在newDatesCreator將更換格式 所以這裡要用let, 不能用const
    const { file } = req
    const dates = newDatesCreator(classDay) // 老師可以上課的所有日期 dates

    return Promise.all([
      User.findByPk(teacherId),
      Class.findOne({ where: { teacherId } }),
      localFileHandler(file),
      List.findAll({ where: { duration30or60 }, raw: true }),
    ])
      .then(([user, classData, filePath, lists]) => {
        if(!user) throw new Error('There is no such user :(')
        if(classData) throw new Error('You have been already a teacher')
        const classNumberInOneDay = lists.length // 每天可約的時段數量有幾個
        
        return user.update({ 
          isTeacher: 1,
          image: filePath || null, 
          intro,
          nation
        })
        .then(() => {
          return Class.create({ 
            intro, style, link, classDay, teacherId, duration30or60, nation,
            teacherName: user.toJSON().name,
            image: filePath || null
          })          
        })
        .then((classCreated) => {
          const classId = classCreated.id
          // recordPromises ＋ Promise.all: 是處理多個非同步操作的最佳實踐
          // (1) 確保所有的 Record.create 完成後才進行下一步
          // (2) 錯誤處理更容易: 若任一個 Record.create 操作失敗，Promise.all 會立即拒絕並進入 .catch 區塊
          const recordPromises = [] 
          for (let i = 0; i < dates.length; i++ ) {
            for (let j = 0; j < classNumberInOneDay; j++ ) {
              let chosenOclock = lists.filter(list => list.oclock === lists[j].oclock)
              let timeListId = chosenOclock[0].id
              recordPromises.push(
                Record.create({
                  teacherId,
                  timeListId,
                  date: dates[i],
                  oclock: lists[j].oclock,
                  classId
                })                
              )
            }
          }
          return Promise.all(recordPromises)
        })
      })
      .then(() => {
        req.flash('success_msg', '歡迎成為老師！')
        return res.redirect('/teacher/profile')      
      })
      .catch(err => next(err))      
  },
  getProfile: (req, res, next) => {
    const { id } = req.params
    if (parseInt(id) !== req.user.id) throw new Error('You can see your own profile.')
    return Promise.all([
      User.findByPk(id, { raw: true }),
      Record.findAll({ 
        where: { 
          studentId: id,
          date: { [Sequelize.Op.not]: null } 
        }, 
        include: [User, Class],
        raw: true,
        nest: true
      }),
      // 目標：這個record2 是為了取出學生已上過的課
      // 方式：拿出所有 有被學生預約 or 已完成課程的課
      // 方式：換句話說：先排除 有開課但沒學生約的課
      Record.findAll({ 
        where: {  
          studentId: { [Sequelize.Op.not]: null } 
        },
        raw: true
      })
    ])
      .then(([user, records, records2]) => {
        // 取出未來的 records
        const currentDate = dayjs() // 獲取當前日期
        const recordsBefore = []
        const recordsAfter = []
        records.forEach(record => {
          const [dateString, dayOfWeek] = record.date.split(' ')
          const dateObj = dayjs(dateString)
          if (dateObj.isAfter(currentDate)) {
            recordsAfter.push(record)
          } else {
            recordsBefore.push(record)
          }
        })

        // 以下 for records2 Ranking
        // 取出學生已上過的課
        const totalRecordsFinishedClass = []       
        records2.forEach(record2 => {
          const [dateString, dayOfWeek] = record2.date.split(' ')
          const dateObj = dayjs(dateString)
          if (dateObj.isBefore(currentDate)) { // 拿出學生過去已上課過的課程
            // if (dateObj.isAfter(currentDate)) { // 拿出學生未來已預約的課程
            totalRecordsFinishedClass.push(record2)
          } 
        })   

        // userIdFinishClass：取出 所有已上過課學生的 id 陣列 
        let userIdFinishClass = totalRecordsFinishedClass.map(record => record.studentId)
        userIdFinishClass = Array.from(new Set(userIdFinishClass)) // 去除重複

        // dataRawNecessary: 移除多餘data＋重構data格式
        const dataRawNecessary = totalRecordsFinishedClass.map(record => {
          return {
            studentId: record.studentId, 
            date: record.date,
            oclock: record.oclock
          }
        })

        // 將 userId 依序(forEach) 再重構成必要格式
        let dataCalculated = []
        userIdFinishClass.forEach(userId => {
          const dataFor1User = dataRawNecessary.filter(result => result.studentId === userId)
          const hours30min = dataFor1User.filter(record => record.oclock.includes('30'))
          const hours60min = dataFor1User.filter(record => !record.oclock.includes('30'))
          const totalHours = hours30min.length * 0.5 + hours60min.length * 1
          dataCalculated.push({ 
            id: userId,
            totalHours: totalHours
          }) 
        })

        // 完成 ranking
        const dataSorted = dataCalculated.sort((a, b) => b.totalHours - a.totalHours) // 將obj依totalHours排序
        const useIdSorted = dataSorted.map(obj => obj.id) // 依totalHours排序 成arr
        const ranking = useIdSorted.indexOf(req.user.id) + 1
        const totalHours = dataSorted.find(obj => obj.id === req.user.id)?.totalHours // 串連運算子: 前者有值才繼續, 無值也不會引發錯誤
        const numberOfStudents = dataSorted.length

        res.render('profile', { 
          user, 
          recordsBefore: recordsBefore.slice(0,5),
          recordsAfter: recordsAfter.slice(0,2),
          ranking,
          totalHours,
          numberOfStudents
        })          
      })
      .catch(err => next(err))
  },
  editProfile: (req, res, next) => {
    const { id } = req.params
    if (parseInt(id) !== req.user.id) {
      req.flash('error_msg', 'You can see your own profile only.')
      return res.redirect(`/classes`)
    }
    return User.findByPk(id, { raw: true })
      .then(user => res.render('edit-profile', { user }))
      .catch(err => next(err))
  },
  putProfile: (req, res, next) => {
    const { id } = req.user
    const { intro, nation, name } = req.body
    const { file } = req

    return Promise.all([
      User.findByPk(id),
      localFileHandler(file)
    ])
      .then(([user, filePath]) => {
        if(!user) throw new Error('There is no such user :(')   
        user.update({ 
          name, nation, intro,
          image: filePath || user.image
        })
        req.flash('success_msg', '更新成功')
        return res.redirect(`/users/${id}/profile`)        
      })
      .catch(err => next(err))         
  }  
}

module.exports = userController