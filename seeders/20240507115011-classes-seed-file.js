'use strict';
const { User } = require('../models')
const faker = require('faker')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // for 單一 data
    // try{
    //   await queryInterface.bulkInsert('Classes', [{
    //   teacher_id: 64,
    //   teacher_name: 'test teacher',
    //   duration30or60: true,
    //   class_day: JSON.stringify(['4', '5']), // 將多個字串轉換為 JSON 數組
    //   nation: 'Taiwan seeder',
    //   style: 'cool',
    //   intro: 'No words',
    //   image: 'www.dfsdfasdfadf.com',
    //   score_avg: 3,
    //   link: `www.324.com`,
    //   created_at: new Date,
    //   updated_at: new Date
    // }], {})
    // } catch (err) {
    //   console.error('Error in up migration:', err)
    // }

    // for 多筆 data
    return User.findAll({ 
      where: { 
        nation: { [Sequelize.Op.like]: '%seeder%' }, // 只把seeder拿進來
        name: { 
          [Sequelize.Op.notLike]: '%user%', // 排除學生
          [Sequelize.Op.not]: 'root' 
        },
      } 
    })
      .then(users => {
        const classData = users.map(user => {

          // for classDay 不重複
          const weekdays = ['0','1','2','3','4','5','6']
          const randomA = Math.floor(Math.random()*7).toString()
          const weekdaysLeft = weekdays.filter(day => day !== randomA)
          const magicNumber = Math.floor(Math.random()*6)
          let randomB = weekdaysLeft.slice(magicNumber, magicNumber+1)
          randomB = randomB[0] // 將矩陣內的字串拿出來

          return {
            teacher_id: user.id,
            teacher_name: user.name,
            duration30or60: true,
            class_day: JSON.stringify([randomA, randomB]), // 將多個字串轉換為 JSON 數組
            nation: user.nation,
            style: faker.lorem.text().slice(0, 20),
            intro: user.intro,
            image: user.image,
            link: `www.${Math.floor(Math.random()*10)}${Math.floor(Math.random()*10)}${Math.floor(Math.random()*10)}.com`,
            created_at: new Date,
            updated_at: new Date
          }
        })
        return queryInterface.bulkInsert('Classes', classData, {})
      })
      .catch(err => console.error('Error in up migration: ', err))

      
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Classes', {
      nation: { [Sequelize.Op.like]: '%seeder%' }
    })
  }
};
