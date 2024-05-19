const dayjs = require('dayjs');

const add1Helper = classDay => {
  return classDay + 1
}

const newDatesCreator = classDay => {
  let currentDate = dayjs() // 獲取當前日期
  const newDates = [] 

  for (let i = 0; i < 15; i++) {
    if (i === 0) { // 1個等號用於賦值, 3個等號用於條件比較
      currentDate = currentDate.add(1, 'day')
      continue
    }
    if (classDay.length < 2) {
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

module.exports = {
  add1Helper,
  newDatesCreator
}