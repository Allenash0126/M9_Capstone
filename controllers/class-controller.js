const { Class, User, Record } = require('../models')
const dayjs = require('dayjs');
const Sequelize = require('sequelize');

const classController = {
  getClasses: (req, res, next) => {
    const { keywords } = req.query

    return Promise.all([
      Class.findAll({ raw: true }),
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
        const recordsBnow = []
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
          // if (dateObj.isBefore(currentDate)) { // 拿出學生過去已上課過的課程
            if (dateObj.isAfter(currentDate)) { // 拿出學生未來已預約的課程
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
        // 下面結果如上, 賦予dataSorted有ranking
        // for (i = 0; i < dataSorted.length; i++) {
        //   dataSorted[i].ranking = i + 1
        // }

        // 關於 search bar
        if (keywords) {
          classes = classes.filter(classData => classData.teacherName.includes(keywords))
          return res.render('classes', { classes, dataRanked })          
        }

        return res.render('classes', { classes, dataRanked })
      })
      .catch(err => next(err))
  },
  getClass: (req, res, next) => {
    const { id } = req.params
    return Promise.all([
      Class.findByPk(id, { raw: true }),
      Record.findAll({ 
        where: { classId: id },
        raw: true
      })
    ])
      .then(([classData, records]) => {
        records = records.filter(record => !record.studentId)     
        res.render('class', { class: classData, records }
      )})
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
        if(!record2) throw new Error('There is no such record')
        if (record2.studentId !== req.user.id) throw new Error('You can comment your teacher only')
        const { teacherId } = record2.Class
        record1.update({ comment, score })        
        req.flash('succes_msg', 'Commented successfully')

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
      return  req.flash('success_msg', '您是老師, 沒有預約課程的權限 : ( ')
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