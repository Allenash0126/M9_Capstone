const dayjs = require('dayjs');
const { User } = require('./models')
const Sequelize = require('sequelize')

// // 獲取當前日期
// const today = dayjs();

// // 加上14天
// const futureDate = today.add(14, 'day');

// // 取得結果的月份、日期和星期幾
// const month = futureDate.format('M');
// const date = futureDate.format('D');
// const dayOfWeek = futureDate.format('dddd');



// // 顯示結果
// console.log(`14 天後是 ${month} 月 ${date} 號星期 ${dayOfWeek}`);


// // 設定目標日期為 2024 年 5 月 4 號
// const targetDate = dayjs('2025-05-04');



// // 計算兩個日期之間的天數差距
// const differenceInDays = targetDate.diff(today, 'day');

// // 輸出結果
// console.log(`2024年5月4號與今天相差 ${differenceInDays} 天`);


// // 獲取當前日期並以所需格式進行格式化
// const formattedDate = dayjs().format('YYYY-MM-DD dddd');

// // 輸出結果
// console.log(formattedDate);

// // 




// 獲取當前日期
let currentDate = dayjs();

// 保存符合條件的日期的陣列
const dates = [];

// 列出兩週內的日期（14天）
for (let i = 0; i < 14; i++) {
  // 檢查是否是星期一、星期二、星期三或星期五，如果是，則加入陣列
  // if (currentDate.day() === 1 || currentDate.day() === 2 || currentDate.day() === 3 || currentDate.day() === 5) {
  
  if (currentDate.day() === 5) {
    // 格式化日期，包括星期幾
    const formattedDate = currentDate.format('YYYY-MM-DD dddd');
    // 格式化日期，不包括星期幾
    // const formattedDate = currentDate.format('YYYY-MM-DD');
  
    // 將符合條件的日期加入陣列
    dates.push(formattedDate);
  }

  // 移到下一天
  currentDate = currentDate.add(1, 'day');
}

// 輸出結果
// console.log('dates 老師可以上課的所有日期', dates);


const objY = {};

dates.forEach(date => {
  objY[date] = [2, 3, 4];
});

// console.log('objY 老師可上課的所有日期＋所有時段', objY);

const list = [2, 3, 4]

const newArr = []
for(i = 0; i < dates.length; i++) {
  for(j = 0; j < list.length; j++) {
    newArr.push(dates[i])
    newArr.push(list[j])
  }
}

// console.log('newArr 分別紀錄老師可上課的日期＋時段', newArr);




currentDate = dayjs(); // 取得當前日期

let a = ['2024-04-29', '2024-04-30', '2024-05-01', '2024-05-02'];
const oldDates = [ '2024-04-29 Monday', '2024-05-02 Thursday' ]

let beforeCurrentDate = []; // 存放當前日期之前的日期的陣列
let afterCurrentDate = []; // 存放當前日期之後的日期的陣列

// 遍歷陣列中的每個日期
oldDates.forEach(date => {
  const [dateString, dayOfWeek] = date.split(' '); // 將日期與星期分開
  let dateObj = dayjs(dateString); // 將字串日期轉換為 Day.js 物件
  const formattedDate = `${dateString} ${dayOfWeek}`; // 保留星期幾的資訊
  if (dateObj.isBefore(currentDate)) {
    beforeCurrentDate.push(formattedDate); // 將當前日期之前的日期添加到 beforeCurrentDate 陣列中
  } else {
    afterCurrentDate.push(formattedDate); // 將當前日期之後的日期添加到 afterCurrentDate 陣列中
  }
});

// console.log('當前日期之前的日期：', beforeCurrentDate);
// console.log('當前日期之後的日期：', afterCurrentDate);

const exam1 = '0'
const exam2 = '1'

// console.log('!exam1', !parseInt(exam1))
// console.log('!exam2', !parseInt(exam2))


const arr1 = [{
  name: 'allen',
  age: '11'
}, {
  name: 'bob',
  age: '33'
}]
const arr2 = [{
  name: 'candy',
  age: '14'
}, {
  name: 'denny',
  age: '40'
}]

const g1 = []
g1.push(arr1, arr2)
// console.log('g1', g1)

const g2 = []
g2.push(arr1)
g2.push(arr2)
// console.log('g2', g2)

const g3 = []
g3.push(...arr1, ...arr2)
// console.log('g3', g3)

const records = [
  {
    id: 248,
    teacherId: 6,
    studentId: null,
    timeListId: 2,
    score: null,
    comment: null,
    date: '2024-05-12 Sunday',
    oclock: '19:00 - 20:00',
    classId: 5
  },
  {
    id: 249,
    teacherId: 6,
    studentId: null,
    timeListId: 2,
    score: null,
    comment: null,
    date: '2024-05-05 Sunday',
    oclock: '19:00 - 20:00',
    classId: 5,
  },
  {
    id: 250,
    teacherId: 6,
    studentId: null,
    timeListId: 1,
    score: null,
    comment: null,
    date: '2024-05-05 Sunday',
    oclock: '18:00 - 19:00',
    classId: 5,

  },
  {
    id: 251,
    teacherId: 6,
    studentId: null,
    timeListId: 1,
    score: null,
    comment: null,
    date: '2024-05-12 Sunday',
    oclock: '18:00 - 19:00',
    classId: 5,
  },
  {
    id: 252,
    teacherId: 6,
    studentId: null,
    timeListId: 4,
    score: null,
    comment: null,
    date: '2024-05-05 Sunday',
    oclock: '20:00 - 21:00',
    classId: 5
  },
  {
    id: 253,
    teacherId: 6,
    studentId: null,
    timeListId: 4,
    score: null,
    comment: null,
    date: '2024-05-12 Sunday',
    oclock: '20:00 - 21:00',
    classId: 5
  },
  {
    id: 254,
    teacherId: 6,
    studentId: null,
    timeListId: 1,
    score: null,
    comment: null,
    date: '2024-05-07 Tuesday',
    oclock: '18:00 - 19:00',
    classId: 5
  },
  {
    id: 255,
    teacherId: 6,
    studentId: null,
    timeListId: 2,
    score: null,
    comment: null,
    date: '2024-05-07 Tuesday',
    oclock: '19:00 - 20:00',
    classId: 5
  },
  {
    id: 256,
    teacherId: 6,
    studentId: null,
    timeListId: 4,
    score: null,
    comment: null,
    date: '2024-05-07 Tuesday',
    oclock: '20:00 - 21:00',
    classId: 5
  },
  {
    id: 257,
    teacherId: 6,
    studentId: null,
    timeListId: 1,
    score: null,
    comment: null,
    date: '2024-05-14 Tuesday',
    oclock: '18:00 - 19:00',
    classId: 5
  },
  {
    id: 258,
    teacherId: 6,
    studentId: null,
    timeListId: 2,
    score: null,
    comment: null,
    date: '2024-05-14 Tuesday',
    oclock: '19:00 - 20:00',
    classId: 5
  },
  {
    id: 259,
    teacherId: 6,
    studentId: null,
    timeListId: 4,
    score: null,
    comment: null,
    date: '2024-05-14 Tuesday',
    oclock: '20:00 - 21:00',
    classId: 5
  }
]

const recordFormateed = records.map(record => record.date)


//

const faker = require('faker')
const bcrypt = require('bcryptjs')

const seedStudent = Array.from({ length: 5 }, (n, i) => ({
  name: `user${i + 1}`,
  email: `user${i + 1}@example.com`,
  // password: await bcrypt.hash('12345678', 10),
  password: bcrypt.hash('12345678', 10),
  intro: faker.lorem.text().slice(0, 20),
  image: `https://loremflickr.com/320/240/dog/?random=${Math.random() * 100}`,
  is_teacher: false,
  nation: 'Taiwan',
  created_at: new Date,
  updated_at: new Date
}))
const seedTeacher = Array.from({ length: 10 }, (n, i) => ({
  name: faker.name.findName(),
  email: faker.internet.email(),
  // password: await bcrypt.hash('12345678', 10),
  password: bcrypt.hash('12345678', 10),
  intro: faker.lorem.text().slice(0, 20),
  image: `https://loremflickr.com/320/240/cat/?random=${Math.random() * 100}`,
  is_teacher: true,
  nation: 'USA',
  created_at: new Date,
  updated_at: new Date
}))

const seedAmin = {
  name: 'root',
  email: 'root@example.com',
  // password: await bcrypt.hash('12345678', 10),
  password: bcrypt.hash('12345678', 10),
  intro: faker.lorem.text().slice(0, 20),
  image: `https://loremflickr.com/320/240/cat/?random=${Math.random() * 100}`,
  is_teacher: false,
  nation: 'USA',
  created_at: new Date,
  updated_at: new Date
}
// console.log('testArray~~', seedStudent)
// console.log('seedTeacher~~', seedTeacher)
// console.log('seedAmin~~', seedAmin)

const seeder = [seedAmin, ...seedStudent, ...seedTeacher]
// console.log('seeder~~', seeder)


// for classDay 不重複


// User.findAll({ 
//   where: { nation: { [Sequelize.Op.like]: '%seeder%' } } 
// })
//   .then(users => {
//     const classData = users.map(user => {

//       const weekdays = ['0','1','2','3','4','5','6']
//       const randomA = Math.floor(Math.random()*7).toString()
//       const weekdaysLeft = weekdays.filter(day => day !== randomA)
//       const magicNumber = Math.floor(Math.random()*6)
//       let randomB = weekdaysLeft.slice(magicNumber, magicNumber+1)
//       randomB = randomB[0] // 將矩陣內的字串拿出來

//       return {
//         teacher_id: user.id,
//         teacher_name: user.name,
//         duration30or60: true,
//         class_day: [randomA, randomB],
//         nation: user.nation,
//         style: faker.lorem.text().slice(0, 20),
//         intro: user.intro,
//         image: user.image,
//         link: `www.${Math.floor(Math.random()*10)}${Math.floor(Math.random()*10)}${Math.floor(Math.random()*10)}.com`,
//         created_at: new Date,
//         updated_at: new Date
//       }
//     })
//     // console.log('classData~~~~~', classData)
//   })

// console.log('randomA~~', randomA)
// console.log('weekdaysLeft~~', weekdaysLeft)
// console.log('magicNumber~~', magicNumber)
// console.log('randomB~~', randomB)

const cht = 1
if (cht) {
  return console.log('it is 1 ')
} 
console.log('it is 2 ')
