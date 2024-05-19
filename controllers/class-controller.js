const { Class, User, Record, List } = require('../models')
const dayjs = require('dayjs');
const Sequelize = require('sequelize')
const { getOffset, getPagination } = require('../helpers/pagination-helper');
const { newDatesCreator } = require('../helpers/record-helpers')

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
        let currentDate = dayjs()     

        return Promise.all([
          List.findAll({ where: { duration30or60 }, raw: true }), // for Group Create
          Record.findAll({ where: { classId } })
        ])
          .then(([lists, records]) => {

            // 首先取得 records 內已儲存的 date, 存放於 oldDates
            const oldDatesDuplicated = records.map(record => record.date) // 內含多組重複的日期
            const oldDates = Array.from(new Set(oldDatesDuplicated)) // Set可移除重複data 且為Obj, 須再轉為Arr
            
            // 為了區分 已存在於 DB 的日期, 是比今天更早、或更晚
            // 命名說明: 若有 dates開頭, 表示該陣列為日期陣列
            const oldDatesBnow = []; // 「早」於今天的日期陣列, 命名說明 Bnow = Before Now, 
            const oldDatesAnow = []; // 「晚」於今天的日期陣列, 命名說明 Anow = After Now
            oldDates.forEach(oldDate => {
              const [dateString, dayOfWeek] = oldDate.split(' ')
              const dateObj = dayjs(dateString) // 將字串轉成物件 讓外掛 dayjs 可以幫忙處理 isBefore & isAfter
              const formattedDate = `${dateString} ${dayOfWeek}`
              if (dateObj.isBefore(currentDate)) {
                oldDatesBnow.push(formattedDate)
              } else {
                oldDatesAnow.push(formattedDate)
              }
            })
            
            // 將對應的完整data放入陣列
            // 命名說明: 若有 records 開頭, 表示該陣列為raw data, 且為非raw: true 的格式, 便於後續直接對 DB 操作
            const recordsBnow = records.filter(record => oldDatesBnow.includes(record.date))
            const recordsAnow = records.filter(record => oldDatesAnow.includes(record.date))

            // 區分對應的data 是否學生已經上課過, 老師是否已經教學過 taught
            const recordsBnowTaught = recordsBnow.filter(data => data.studentId)
            const recordsBnowNonTaught = recordsBnow.filter(data => !data.studentId)  

            // 找出過往的課程 是否碰巧也符合 現在所選擇的課程
            const recordsAnowFitNewDates = recordsAnow.filter(record => newDates.includes(record.date))

            // 若過往課程 剛好也符合現在所選課程, 進一步確認是否有更改 duration (30 or 60)
            // 命名說明: 若符合 duration, 則結尾為 FitDuration; 若不符合, 則結尾為 AntiDuration
            const recordsAnowFitDuration = []
            const recordsAnowAntiDuration = []
            recordsAnowFitNewDates.forEach(data => {
              const durationFromDB = parseInt(duration30or60)
              const durationFromBrowser = data.oclock.includes(':30')
              if ((durationFromDB && !durationFromBrowser) || (!durationFromDB && durationFromBrowser)) {
                recordsAnowFitDuration.push(data)
              } else {
                recordsAnowAntiDuration.push(data)
              }
            })
            
            // 舊data中, 篩出跟newDates不同的data, 後續將 delete
            const recordsAnowAntiNewDates = recordsAnow.filter(record => !newDates.includes(record.date)) 
            // 新dates中, 篩出舊data沒有的日期, 後續將 create
            const newDatesAntiRecords = newDates.filter(newDate => !oldDates.includes(newDate)) 

            // 把三種行為的群組 各自分組集合 ex: Save, Destroy, Create
            // 命名說明: g 表示 Group                 
            const g1RecordsSave = []
            const g2RecordsDestroy = []
            const g3DatesCreate = []
            const newDatesAntiDurationDuplicated = recordsAnowAntiDuration.map(record => record.date) // 因來源是records, 所以會重複
            const newDatesAntiDuration = Array.from(new Set(newDatesAntiDurationDuplicated)) // Set可移除重複data且為Obj, 須再轉為Arr
            // 執行
            g1RecordsSave.push(...recordsBnowTaught, ...recordsAnowFitDuration)
            g2RecordsDestroy.push(...recordsBnowNonTaught, ...recordsAnowAntiDuration, ...recordsAnowAntiNewDates)
            g3DatesCreate.push(...newDatesAntiDuration, ...newDatesAntiRecords)

            // Group1 for Save
            // Do nothing

            // Group2 for Destroy
            g2RecordsDestroy.forEach(record => record.destroy())

            // Group3 for Create
            // 避免：非同步事件 造成未建檔完就先render, 此將導致資料庫尚未建立完 畫面就被送出一個空矩陣 recordsUpdated
            // 所以：這裡用此 g3DatesCreatePromise的空陣列 + Promise.all(g3DatesCreatePromise)
            // 確保：所有 for loop 跑完以後 再render
            const classNumberInOneDay = lists.length // 每天可約的時段數量有幾個, 且此Lists為browser所選的
            const g3DatesCreatePromise = [] 
            for (let i = 0; i < g3DatesCreate.length; i++ ) {
              for (let j = 0; j < classNumberInOneDay; j++ ) {
                let chosenOclock = lists.filter(list => list.oclock === lists[j].oclock)
                let timeListId = chosenOclock[0].id
                g3DatesCreatePromise.push(
                  Record.create({
                    teacherId,
                    timeListId,
                    date: g3DatesCreate[i],
                    oclock: lists[j].oclock,
                    classId
                  })
                )      
              }
            }
            Promise.all(g3DatesCreatePromise)
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
                recordsUpdated = recordsUpdated.filter(record => !record.studentId)
                const history = recordsBnowTaught.map(record => record.toJSON()).filter(record => record.comment)             
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