const { User, Class, Record, List } = require('../models')
const { localFileHandler } = require('../helpers/file-helpers')
const dayjs = require('dayjs');

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
    currentDate = dayjs() // 把 currentDate調整回今天的日期
    console.log('新的可以被預約的 newDates~~~~~~', newDates)

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
    // return Record.findAll({ where: { classId } })
    //   .then(records => {

        // 取得 records 內已儲存的 date 於 oldDates
        const oldDatesDuplicated = records.map(record => record.date) // 內含多組重複的日期
        const oldDates = Array.from(new Set(oldDatesDuplicated)) // Set可移除重複data 且為Obj, 須再轉為Arr
        
        const oldDatesBnow = []; // 存放當前日期之前的日期的陣列
        const oldDatesAnow = []; // 存放當前日期之後的日期的陣列

        // 遍歷陣列中的每個日期
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

        console.log('oldDates: ', oldDates)
        console.log('oldDatesBnow: 在舊的data中, 是當前日期之「前」的日期 oldDatesBnow: ', oldDatesBnow)
        console.log('oldDatesAnow: 在舊的data中, 是當前日期之「後」的日期 oldDatesAnow: ', oldDatesAnow)
        
        const recordsBnow = records.filter(record => oldDatesBnow.includes(record.date))
        const recordsAnow = records.filter(record => oldDatesAnow.includes(record.date))
        console.log('recordsBnow: 在舊的data中, 是當前日期之「前」的日期的raw data: ', recordsBnow)
        console.log('recordsAnow: 在舊的data中, 是當前日期之「後」的日期的raw data: ', recordsAnow)

        const recordsBnowTaught = recordsBnow.filter(data => data.studentId)
        const recordsBnowNonTaught = recordsBnow.filter(data => !data.studentId)
        console.log('recordsBnowTaught: 在舊的data中, 用filter方法: 篩出「有」studentId 的 raw data', recordsBnowTaught)
        console.log('recordsBnowNonTaught: 在舊的data中, 用filter方法: 篩出「無」studentId 的 raw data', recordsBnowNonTaught)              

        // 2號：仍須確認
        const recordsAnowFitNewDates = recordsAnow.filter(record => newDates.includes(record.date))
        const recordsAnowFitDuration = []
        const recordsAnowAntiDuration = []
        recordsAnowFitNewDates.forEach(data => {
          // 確認這次更新 user是否選到跟DB同樣的 duration30or60
          const durationFromDB = parseInt(duration30or60)
          const durationFromBrowser = data.oclock.includes(':30')
          if ((durationFromDB && !durationFromBrowser) || (!durationFromDB && durationFromBrowser)) {
            recordsAnowFitDuration.push(data)
          } else {
            recordsAnowAntiDuration.push(data)
          }
        })
        
        // 3號：準備delete的組別
        const recordsAnowAntiNewDates = recordsAnow.filter(record => !newDates.includes(record.date)) 
        // 45號：準備create的組別
        const newDatesAntiRecords = newDates.filter(newDate => !oldDates.includes(newDate)) 
        console.log('recordsAnowFitNewDates: 取出2號: 在未來 被包含在新data的舊data', recordsAnowFitNewDates)
        console.log('recordsAnowFitDuration: 取出2號: 在未來 被包含在新data的舊data 與本次更新有「同樣」的duration30or60', recordsAnowFitDuration)
        console.log('recordsAnowAntiDuration: 取出2號: 在未來 被包含在新data的舊data 與本次更新有「不同」的duration30or60', recordsAnowAntiDuration)
        console.log('recordsAnowAntiNewDates: 取出3號: 在未來 不被包含在新data的舊data', recordsAnowAntiNewDates)
        console.log('newDatesAntiRecords: 取出4+5號:在未來 不包含舊data的新data', newDatesAntiRecords)
        
        const g1RecordsSave = []
        const g2RecordsDestroy = []
        const g3DatesCreate = []
        const newDatesAntiDuration = recordsAnowAntiDuration.map(record => record.date) // 

        // 把三種行為的群組 各自分組集合 包含: Save, Destroy, Create
        g1RecordsSave.push(...recordsBnowTaught, ...recordsAnowFitDuration)
        g2RecordsDestroy.push(...recordsBnowNonTaught, ...recordsAnowAntiDuration, ...recordsAnowAntiNewDates)
        g3DatesCreate.push(...newDatesAntiDuration, ...newDatesAntiRecords)
        console.log('g1RecordsSave ~~~~~~', g1RecordsSave)
        console.log('g2RecordsDestroy ~~~~~~', g2RecordsDestroy)
        console.log('newDatesAntiDuration ~~~~~~ ', newDatesAntiDuration)
        console.log('g3DatesCreate ~~~~~~', g3DatesCreate)

        // Group for Save
        // Do nothing

        // Group for Destroy
        g2RecordsDestroy.forEach(record => record.destroy())

        // Group for Create
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
      // .catch(err => next(err))

      // 可參考如何刪除 不只一組data 
      // (注意: destroy一次只能刪一組, 所以用forEach 來執行)
      // return List.findAll({ where: { oclock: 'test for records 1' } })
      // .then(lists => {
      //   console.log('lists~~~~', lists)
      //   return lists.forEach(list => list.destroy()) 
      // })
    
    // 以下是原本的 putProfile的內容 
    // const { intro, style, link, classDay, duration30or60, nation, teacherName } = req.body
    // const { file } = req

    // return Promise.all([
    //   User.findByPk(req.user.id),
    //   Class.findByPk(req.params.id),
    //   localFileHandler(file),
    //   List.findAll({ where: { duration30or60 }, raw: true }),
    //   Class.findAll({ raw: true }),
    //   // Record.findAll({ where: { classId }, raw: true })
    // ])
    //   .then(([user, classData, filePath, lists, classesDatas]) => {
    //     if(!user) throw new Error('There is no such user :(')
    //     if(!classData) throw new Error('You are not a teacher now. Please sign up for 成為老師') 
    //     const classNumberInOneDay = lists.length // 每天可約的時段數量有幾個

    //     classData.update({ 
    //       intro, style, link, classDay, duration30or60, nation, teacherName, 
    //       teacherId: req.user.id,
    //       image: filePath || classData.image 
    //     })
    //     user.update({ 
    //       nation, intro,           
    //       name: teacherName, 
    //       image: filePath || classData.image
    //     })
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