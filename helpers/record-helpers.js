const dayjs = require('dayjs');
const { User, Class, List, Record } = require('../models')

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
  recordCreator,
  // recordUpdator
}