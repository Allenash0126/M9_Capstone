const dayjs = require('dayjs');
const { Record } = require('../models')

const newDatesCreator = classDay => {
  // 先判定：若為多天課程, 則為 JSON檔; 而parse可將 JSON檔轉為可操作的型別
  if (typeof classDay === 'string') {
    classDay = JSON.parse(classDay);
  }        
  const newDates = [] 
  let currentDate = dayjs() // 獲取當前日期

  for (let i = 0; i < 15; i++) {
    // 商業邏輯：定義 當日不能被預約, 故跳過今天符合user選擇的星期幾
    if (i === 0) { // 1個等號用於賦值, 3個等號用於條件比較
      currentDate = currentDate.add(1, 'day')
      continue
    }
    
    // 先確認: 是否老師每週只選一天課程 
    // 若只選一天課程就非 array, 而是string, 而 some 只能用於array（多天課程）
    if (classDay.length < 2 || !classDay.length) {
      if (parseInt(classDay) === currentDate.day()) {
        const formattedDate = currentDate.format('YYYY-MM-DD dddd')
        newDates.push(formattedDate);
      }
      currentDate = currentDate.add(1, 'day')      
    } else {
      if (classDay.some(day => parseInt(day) === currentDate.day())) {         
        const formattedDate = currentDate.format('YYYY-MM-DD dddd')
        newDates.push(formattedDate);
      }
      currentDate = currentDate.add(1, 'day')            
    }
  }  
  return newDates
}

const recordsManager = (lists, records, newDates, duration30or60, classId, teacherId, next) => {
  let currentDate = dayjs()     
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
  // 命名說明: 若有 records 開頭, 表示該陣列為raw data, 且不是raw: true 的格式, 便於後續直接對 DB 操作
  const recordsBnow = records.filter(record => oldDatesBnow.includes(record.date))
  const recordsAnow = records.filter(record => oldDatesAnow.includes(record.date))

  // 區分對應的data 是否學生已經上課過: 已經教學過 Taught, 未教學過 nonTaught
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
  return Promise.all(g3DatesCreatePromise)  
    .catch(err => next(err))
}

const recordsWithComments = records => {
  let currentDate = dayjs()     
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
  // 命名說明: 若有 records 開頭, 表示該陣列為raw data, 且不是raw: true 的格式, 便於後續直接對 DB 操作
  const recordsBnow = records.filter(record => oldDatesBnow.includes(record.date))
  const recordsAnow = records.filter(record => oldDatesAnow.includes(record.date))

  // 區分對應的data 是否學生已經上課過: 已經教學過 Taught, 未教學過 nonTaught
  const recordsBnowTaught = recordsBnow.filter(data => data.studentId)
  // const dataWithComments = recordsBnowTaught.map(record => record.toJSON()).filter(record => record.comment)

  const dataWithComments = recordsBnowTaught.filter(record => record.comment)
  return dataWithComments
} 


module.exports = {
  newDatesCreator,
  recordsManager,
  recordsWithComments
}