const dayjs = require('dayjs');

// 獲取當前日期
const today = dayjs();

// 加上14天
const futureDate = today.add(14, 'day');

// 取得結果的月份、日期和星期幾
const month = futureDate.format('M');
const date = futureDate.format('D');
const dayOfWeek = futureDate.format('dddd');



// 顯示結果
console.log(`14 天後是 ${month} 月 ${date} 號星期 ${dayOfWeek}`);


// 設定目標日期為 2024 年 5 月 4 號
const targetDate = dayjs('2025-05-04');



// 計算兩個日期之間的天數差距
const differenceInDays = targetDate.diff(today, 'day');

// 輸出結果
console.log(`2024年5月4號與今天相差 ${differenceInDays} 天`);


// 獲取當前日期並以所需格式進行格式化
const formattedDate = dayjs().format('YYYY-MM-DD dddd');

// 輸出結果
console.log(formattedDate);

// 




// 獲取當前日期
let currentDate = dayjs();

// 保存符合條件的日期的陣列
const dates = [];

// 列出兩週內的日期（14天）
for (let i = 0; i < 14; i++) {
  // 檢查是否是星期一或星期三，如果是，則移到下一個可接受的日期
  while (currentDate.day() === 1 || currentDate.day() === 3) {
    currentDate = currentDate.add(1, 'day');
  }

  // 格式化日期，包括星期幾
  // const formattedDate = currentDate.format('YYYY-MM-DD dddd');
  const formattedDate = currentDate.format('YYYY-MM-DD');
  
  // 將符合條件的日期加入陣列
  dates.push(formattedDate);

  // 移到下一天
  currentDate = currentDate.add(1, 'day');
}

// 輸出結果
console.log('dates 老師可以上課的所有日期', dates);


const objY = {};

dates.forEach(date => {
  objY[date] = [2, 3, 4];
});

console.log('objY 老師可上課的所以日期＋所有時段', objY);



// 移除 '2024-04-19' 的值 3
objY['2024-04-19'] = objY['2024-04-19'].filter(value => value !== 3);

// 移除 '2024-04-28' 的值 4
objY['2024-04-28'] = objY['2024-04-28'].filter(value => value !== 4);

console.log('objY 仍可預約的課程 by 移除已被預約的課程', objY);

console.log(`objY['2024-04-19'] 取出特定日期仍可預約的課程`, objY['2024-04-19']);
