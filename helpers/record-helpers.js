const dayjs = require('dayjs');
const { User, Class, List, Record } = require('../models')

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

const recordCreator = req => {
  const teacherId = req.user.id
  const { classDay, duration30or60 } = req.body

  // 老師可以上課的所有日期 dates
  const dates = [] 
  let currentDate = dayjs() // 獲取當前日期
  for (let i = 0; i < 14; i++) {
    if (classDay.some(day => parseInt(day) === currentDate.day())) {
      const formattedDate = currentDate.format('YYYY-MM-DD dddd')
      dates.push(formattedDate);
    }
    currentDate = currentDate.add(1, 'day')
  }  

  return Promise.all([
    List.findAll({ where: { duration30or60 }, raw: true }),
    Class.findAll({ raw: true })
  ])
    .then(([lists, classesDatas]) => {
      const classNumberInOneDay = lists.length // 每天可約的時段數量有幾個

      for (let i = 0; i < dates.length; i++ ) {
        for (let j = 0; j < classNumberInOneDay; j++ ) {
          let chosenOclock = lists.filter(list => list.oclock === lists[j].oclock)
          let timeListId = chosenOclock[0].id            
          Record.create({
            teacherId,
            timeListId,
            date: dates[i],
            oclock: lists[j].oclock,
            classId: classesDatas.length + 1
          })
        }
      }   
    })
    .catch(err => next(err)) 
}



module.exports = {
  newDatesCreator,
  recordCreator,
  // recordUpdator
}