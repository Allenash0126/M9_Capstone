const { User, Class, Record, List } = require('../models')
const { localFileHandler } = require('../helpers/file-helpers')
const { newDatesCreator, recordsManager } = require('../helpers/record-helpers')
const dayjs = require('dayjs');
const Sequelize = require('sequelize');

const teacherController = {
  getProfile: (req, res, next) => {
    const { id } = req.user
    return Promise.all([
      
      // (1) for common user
      User.findByPk(id), 
      Class.findOne({ where: { teacherId: id } }),
      Record.findAll({ 
        where: { 
          teacherId: id,
          studentId: { [Sequelize.Op.not]: null } 
          // [Sequelize.Op.not]可以排除某些條件的data, 這裡將沒有studentId者移除 因為沒被預約
        },  
        include: [User,Class],
        raw: true,
        nest: true
      }),

      // (2) for seeder
      User.findAll({ // 只取出seeder的學生 排除老師＋root
        where: { 
          nation: { [Sequelize.Op.like]: '%seeder%' },
          email: { 
            [Sequelize.Op.like]: '%example%', 
            [Sequelize.Op.notLike]: '%root%', 
          }
        }
      }),
      Record.findAll({ 
        where: { teacherId: id },
        raw: true
      })
    ])
      .then(([user, classData, records, studentSeeders, recordSeeders]) => {
        // (1) for common user
        if(!user) throw new Error('There is no such user :(')
        if(!classData) throw new Error(`You haven't filled in any info in 成為老師 form`)
        const currentDate = dayjs() // 獲取當前日期

        const recordsAnow = [] // recordsAnow: 表示未來的預約紀錄 records After now
        const recordsBnow = [] // recordsBnow: 表示過往的上課紀錄 records Before now
        records.forEach(record => {
          const [dateString, dayOfWeek] = record.date.split(' ')
          if (dayjs(dateString).isAfter(currentDate)) {
            recordsAnow.push(record)
          } else {
            recordsBnow.push(record)
          }
        })

        const results1 = recordsAnow
        const results2 = recordsBnow

        // (2) for seeder
        const recordCreatePromise = [] 
        // recordCreatePromise 為了確保以下都建立完成後 再統一render, 避免asyn導致未寫入完成就render空物件


        if (user.nation.includes('seeder')) {
          let currentDate = dayjs() 
          let { classDay } = classData // 因為 classDay 是JSON檔, 在newDatesCreator將更換格式 所以這裡要用let, 不能用const
          const newDates = newDatesCreator(classDay)

          // 若此老師為「首次」登入, 則直接新增兩筆 data
          if (!recordSeeders.length) {
            const idStudentSeeders  = studentSeeders.map(studentSeeder => studentSeeder.id)

            const recordCreate1 = {
              teacherId: id,
              studentId: idStudentSeeders[Math.floor(Math.random()*idStudentSeeders.length)],
              date: newDates[0],
              timeListId: 1,
              oclock: '18:00 - 19:00', 
              classId: classData.id
            }
            const recordCreate2 = {
              teacherId: id,
              studentId: idStudentSeeders[Math.floor(Math.random()*idStudentSeeders.length)],
              date: newDates[0],
              timeListId: 2,
              oclock: '19:00 - 20:00', 
              classId: classData.id
            }

            recordCreatePromise.push(              
              Record.create(recordCreate1),          
              Record.create(recordCreate2)
            )

          // 若「非」首次登入, 則判定之前的records是否過期了  
          } else {
            const lastDateRecordSeeder = recordSeeders[recordSeeders.length - 1].date // 取最後一筆 data
            const [dateString, dayOfWeek] = lastDateRecordSeeder.split(' ')
            const dateObj = dayjs(dateString) // 將字串轉成物件, 讓外掛 dayjs 可執行 isBefore          
            
            if (dateObj.isBefore(currentDate, 'day')) {
              const idStudentSeeders  = studentSeeders.map(studentSeeder => studentSeeder.id)

              const recordCreate1 = {
                teacherId: id,
                studentId: idStudentSeeders[Math.floor(Math.random()*idStudentSeeders.length)],
                date: newDates[0],
                timeListId: 1,
                oclock: '18:00 - 19:00', 
                classId: classData.id
              }
              const recordCreate2 = {
                teacherId: id,
                studentId: idStudentSeeders[Math.floor(Math.random()*idStudentSeeders.length)],
                date: newDates[0],
                timeListId: 2,
                oclock: '19:00 - 20:00', 
                classId: classData.id
              }

              // recordCreatePromise 為了確保以上都建立完成後 再統一render, 避免asyn導致未寫入完成就render空物件
              recordCreatePromise.push(              
                Record.create(recordCreate1),          
                Record.create(recordCreate2)
              )
            }
          }
        }

        Promise.all(recordCreatePromise)
          .then(() => {
            return res.render('teacher/profile', { 
              user: user.toJSON(),
              class: classData.toJSON(),
              records: results1.slice(0,2),
              records2: results2.slice(0,5),
              scoreAvg: classData.scoreAvg
            })          
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
    const { intro, style, link, duration30or60, nation, teacherName } = req.body
    const { file } = req
    const classId = req.params.id
    let { classDay } = req.body // 因為 classDay 是JSON檔, 在newDatesCreator將更換格式 所以這裡要用let, 不能用const
    const newDates = newDatesCreator(classDay)

    return Promise.all([
      User.findByPk(req.user.id),
      Class.findByPk(req.params.id),
      localFileHandler(file),
      List.findAll({ where: { duration30or60 }, raw: true }), // for Group Create
      Record.findAll({ where: { classId } })
    ])
      .then(([user, classData, filePath, lists, records]) => {
        const teacherId = req.user.id
        if(!user) throw new Error('There is no such user :(')
        if(!classData) throw new Error('You are not a teacher now. Please sign up for 成為老師') 

        classData.update({ 
          intro, style, link, classDay, duration30or60, nation, teacherName, 
          teacherId,
          image: filePath || classData.image 
        })
        user.update({ 
          nation, intro,           
          name: teacherName, 
          image: filePath || classData.image
        })    

        recordsManager(lists, records, newDates, duration30or60, classId, teacherId)
      })
      .then(() => {
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