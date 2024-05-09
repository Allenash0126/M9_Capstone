const { User, Class, Record, List } = require('../models')
const { localFileHandler } = require('../helpers/file-helpers')
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

        const recordsAnow = []
        const recordsBnow = []
        records.forEach(record => {
          const [dateString, dayOfWeek] = record.date.split(' ')
          if (dayjs(dateString).isAfter(currentDate)) {
            recordsAnow.push(record)
          } else {
            recordsBnow.push(record)
          }
        })

        const results1 = recordsAnow
        const results2 = recordsBnow.filter(record => record.score)

        // (2) for seeder
        if (user.nation.includes('seeder')) {
          const newDates = [] 
          let currentDate = dayjs() 
          for (let i = 0; i < 15; i++) {
            // 商業邏輯：定義 當日不能被預約, 故跳過今天符合user選擇的星期幾
            if (i === 0) { 
              currentDate = currentDate.add(1, 'day')
              continue
            }
            if (classData.classDay.some(day => parseInt(day) === currentDate.day())) {
              const formattedDate = currentDate.format('YYYY-MM-DD dddd')
              newDates.push(formattedDate);
            }
            currentDate = currentDate.add(1, 'day')
          }
          currentDate = dayjs() // 把 currentDate 調整回今天的日期

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

            return Promise.all([
              Record.create(recordCreate1),          
              Record.create(recordCreate2)
            ])

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

              return Promise.all([
                Record.create(recordCreate1),          
                Record.create(recordCreate2)
              ])
            }
          }
        }
        
        return res.render('teacher/profile', { 
          user: user.toJSON(),
          class: classData.toJSON(),
          records: results1.slice(0,2),
          records2: results2.slice(0,5),
          scoreAvg: classData.scoreAvg
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
    const { intro, style, link, classDay, duration30or60, nation, teacherName } = req.body
    const { file } = req
    const classId = req.params.id
    const newDates = [] 
    let currentDate = dayjs() // 獲取當前日期
    for (let i = 0; i < 15; i++) {
      // 商業邏輯：定義 當日不能被預約, 故跳過今天符合user選擇的星期幾
      if (i === 0) { // 1個等號用於賦值, 3個等號用於條件比較
        currentDate = currentDate.add(1, 'day')
        continue
      }
      if (classDay.some(day => parseInt(day) === currentDate.day())) {
        const formattedDate = currentDate.format('YYYY-MM-DD dddd')
        newDates.push(formattedDate);
      }
      currentDate = currentDate.add(1, 'day')
    }  
    currentDate = dayjs() // 把 currentDate 調整回今天的日期

    return Promise.all([
      User.findByPk(req.user.id),
      Class.findByPk(req.params.id),
      localFileHandler(file),
      List.findAll({ where: { duration30or60 }, raw: true }), // for Group Create
      Record.findAll({ where: { classId } })
    ])
      .then(([user, classData, filePath, lists, records]) => {
        if(!user) throw new Error('There is no such user :(')
        if(!classData) throw new Error('You are not a teacher now. Please sign up for 成為老師') 

        classData.update({ 
          intro, style, link, classDay, duration30or60, nation, teacherName, 
          teacherId: req.user.id,
          image: filePath || classData.image 
        })
        user.update({ 
          nation, intro,           
          name: teacherName, 
          image: filePath || classData.image
        })    

        // 以下針對 Records 來撰寫
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
        const classNumberInOneDay = lists.length // 每天可約的時段數量有幾個, 且此Lists為browser所選的
        for (let i = 0; i < g3DatesCreate.length; i++ ) {
          for (let j = 0; j < classNumberInOneDay; j++ ) {
            let chosenOclock = lists.filter(list => list.oclock === lists[j].oclock)
            let timeListId = chosenOclock[0].id          
            Record.create({
              teacherId: req.user.id,
              timeListId,
              date: g3DatesCreate[i],
              oclock: lists[j].oclock,
              classId
            })
          }
        }           
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