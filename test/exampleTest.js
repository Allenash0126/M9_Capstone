const { add1Helper, newDatesCreator } = require('./helpers/test1')
const dayjs = require('dayjs');

// const classDay = 2
// const newNumber = add1Helper(classDay)
// console.log(newNumber)

// const arr = []
// const classWeek = [3, 5]

// for (let i = 0; i < 5; i++) {
//   arr.push(i)
// }
// console.log('arr~~', arr)

const classDay = ["4"]
if (typeof classDay === 'string') {
  classDay = JSON.parse(classDay);
}       
const newDatesEx = newDatesCreator(classDay)
// let currentDate = dayjs() // 獲取當前日期

// for (let i = 0; i < 15; i++) {
//   if (i === 0) { // 1個等號用於賦值, 3個等號用於條件比較
//     currentDate = currentDate.add(1, 'day')
//     continue
//   }
//   if (classDay.length < 2) {
//     if (parseInt(classDay) === currentDate.day()) {
//       const formattedDate = currentDate.format('YYYY-MM-DD dddd')
//       newDates.push(formattedDate);
//     }
//     currentDate = currentDate.add(1, 'day')      
//   } else {
//     if (classDay.some(day => parseInt(day) === currentDate.day())) {         
//       const formattedDate = currentDate.format('YYYY-MM-DD dddd')
//       newDates.push(formattedDate);
//     }
//     currentDate = currentDate.add(1, 'day')            
//   }
// }  
// console.log('currentDate before ~~~', currentDate)
currentDate = dayjs() // 把 currentDate 調整回今天的日期       
console.log('currentDate after ~~~', currentDate)

console.log('newDatesEx after ~~~', newDatesEx)