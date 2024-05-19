const { Class, User, Record, List } = require('../models')
const dayjs = require('dayjs');
const Sequelize = require('sequelize')
const { getOffset, getPagination } = require('../helpers/pagination-helper');
const { newDatesCreator, recordsManager, recordsWithComments } = require('../helpers/record-helpers')

const classController = {
  getClasses: (req, res, next) => {
    
    // 串連運算子(問號的好處)：如果 req.query.keyword 為 null 或 undefined，則整個表達式將返回 undefined，而不會引發錯誤。這樣可以防止出現 Cannot read property 'trim' of null 或 Cannot read property 'trim' of undefined 的錯誤。
    const keywords = req.query.keywords?.trim() 

    const DEFAULT_LIMIT = 6
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(limit, page)

    return Promise.all([
      Class.findAndCountAll({ 
        raw: true,
      }),
      Record.findAll({ 
        where: { 
          studentId: { [Sequelize.Op.not]: null }
        },
        include: [User],
        raw: true,
        nest: true
      })          
    ])
      .then(([classes, records2]) => {
        const currentDate = dayjs() // 獲取當前日期
        const recordsBnow = [] // recordsBnow: 表示過往的上課紀錄 records Before now
        records2.forEach(record => {
          const [dateString, dayOfWeek] = record.date.split(' ')
          if (dayjs(dateString).isBefore(currentDate)) {
            recordsBnow.push(record)
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
            oclock: record.oclock,
            User: record.User
          }
        })

        // 將 userId 依序(forEach) 再重構成必要格式
        let dataCalculated = []
        userIdFinishClass.forEach(userId => {
          const dataFor1User = dataRawNecessary.filter(record => record.studentId === userId)
          const hours30min = dataFor1User.filter(record => record.oclock.includes('30'))
          const hours60min = dataFor1User.filter(record => !record.oclock.includes('30'))
          const totalHours = hours30min.length * 0.5 + hours60min.length * 1
          dataCalculated.push({ 
            id: userId,
            name:  dataFor1User[0].User.name,
            totalHours: totalHours,
            image: dataFor1User[0].User.image
          }) 
        })


        // 完成 ranking
        const dataSorted = dataCalculated.sort((a, b) => b.totalHours - a.totalHours) // 將obj依totalHours排序
        const dataRanked = dataSorted.map((data, position) => ({
          ...data, 
          ranking: position + 1
        }))

        // for search bar & pagination
        // 用 keywords 控制, 若存在 就傳入filter結果 ; 若不存在 就直接回傳 for 首頁
        const matchedClasses = keywords ? classes.rows.filter(classData => classData.teacherName.toLowerCase().includes(keywords.toLowerCase())).slice(offset, offset+limit) : classes.rows.slice(offset, offset+limit)

        return res.render('classes', { 
          dataRanked,
          classes: matchedClasses, 
          keywords,
          pagination: getPagination( // 第三個參數為總數, 依據是否有 keywords 放上filter數量、或全部class數量
            limit, 
            page, 
            keywords ? classes.rows.filter(classData => classData.teacherName.toLowerCase().includes(keywords.toLowerCase())).length : classes.count
          )
        })
      })
      .catch(err => next(err))
  },
  getClass: (req, res, next) => {
    const classId  = req.params.id
    
    return Class.findByPk(classId, { raw: true, attributes: ['classDay', 'duration30or60', 'teacherId'] })
      .then(classData => {
        const { duration30or60, teacherId } = classData
        let { classDay } = classData // 因 classDay是 JSON檔, 在 newDatesCreator將更換格式 所以這裡要用let, 不能用const
        const newDates = newDatesCreator(classDay)

        return Promise.all([
          List.findAll({ where: { duration30or60 }, raw: true }), // for Group Create
          Record.findAll({ where: { classId } })
        ])
          .then(([lists, records]) => {
            recordsManager(lists, records, newDates, duration30or60, classId, teacherId)
              .then(() => {
                return Promise.all([
                  Class.findByPk(classId, { raw: true }),
                  Record.findAll({ 
                    where: { classId },
                    raw: true
                  })
                ])
              })
              .then(([classData, recordsUpdated]) => {
                const history = recordsWithComments(recordsUpdated)
                recordsUpdated = recordsUpdated.filter(record => !record.studentId)
                res.render('class', { class: classData, records: recordsUpdated, history }
              )})        
          })        
      })
      .catch(err => next(err))     
  },  
  getComment: (req, res, next) => {
    const { id } = req.params
    return Record.findByPk(id, { 
      include: [Class],
      raw: true,
      nest: true
    })
      .then(record => {
        if(!record) throw new Error('There is no such record')
        if (record.studentId !== req.user.id) throw new Error('You can comment your teacher only')
        res.render('comment', { record })
      })
      .catch(err => next(err))
  },
  postComment: (req, res, next) => {
    const { comment, score } = req.body
    const { id } = req.params
    return Promise.all([
      Record.findByPk(id),
      Record.findByPk(id, { 
        include: [Class],
        raw: true,
        nest: true
      })
    ])
      .then(([record1, record2]) => {
        if (!record2) throw new Error('There is no such record')
        if (record2.studentId !== req.user.id) throw new Error('You can comment your teacher only')
        if(score < 1 || score > 5 ) throw new Error('The score must be between 1 to 5.')
        const { teacherId } = record2.Class
        record1.update({ comment, score })        
        req.flash('success_msg', 'Commented successfully')

        // 以下 for 計算scoreAvg 並存入
        return Promise.all([
          Record.findByPk(id),
          Record.findAll({ 
            where: { 
              teacherId,
              studentId: { [Sequelize.Op.not]: null }
            },
            include: [Class]
          })          
        ])
      })
      .then(([record1, records]) => {
        const currentDate = dayjs() // 獲取當前日期
        const recordsBnow = []
        records.forEach(record => {
          const [dateString, dayOfWeek] = record.date.split(' ')
          if (dayjs(dateString).isBefore(currentDate)) {
            recordsBnow.push(record)
          } 
        })
        const results2 = recordsBnow.filter(record => record.score)
        const scoreArr = results2.map(result2 => result2.score)
        let scoreTotal = 0
        for (i = 0; i < scoreArr.length; i++) {
          scoreTotal += scoreArr[i]
        }
        const scoreAvg = scoreTotal/scoreArr.length
        results2[0].Class.update({ scoreAvg })
        return res.redirect(`/users/${record1.studentId}/profile`)        
      })

      .catch(err => next(err))
  },
  postRecord: (req, res, next) => {
    const { selectedTiming } = req.body
    const studentId = req.user.id
    const isTeacher = req.user.isTeacher
    const { id } = req.params
    const split = selectedTiming.split(',')
    const timeListId = split[0]
    const date = split[1]

    if (isTeacher) {
      req.flash('error_msg', '您是老師, 沒有預約課程的權限 : ( ')
      return res.redirect(`/classes/${id}`)
    }
    return Promise.all([
      Class.findByPk(id, { raw: true }),
      Record.findOne({ where: { date, timeListId } })
    ])
      .then(([classData, record]) => {
        record.update({ studentId })
        if (record.studentId) {
          res.render('class', { bookingSuccess: classData, class: classData, record: record.toJSON() })
        } else {
          res.render('class', { bookingFailed: classData, class: classData, record: record.toJSON() })
        }
      })
      .catch(err => next(err))
  }
}

module.exports = classController