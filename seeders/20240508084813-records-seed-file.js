'use strict';
const { User, Class, List } = require('../models')
const faker = require('faker')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      // for teacher
      User.findAll({ 
        where: { 
          nation: { [Sequelize.Op.like]: '%seeder%' }, // 只把seeder拿進來
          name: { 
            [Sequelize.Op.notLike]: '%user%', // 只取老師
            [Sequelize.Op.not]: 'root' 
          },
        },
        raw: true
      }),

      // for student
      User.findAll({ 
        where: { 
          nation: { [Sequelize.Op.like]: '%seeder%' }, // 只把seeder拿進來
          name: { 
            [Sequelize.Op.like]: '%user%', // 只取學生 
            [Sequelize.Op.not]: 'root' 
          },
        },
        raw: true
      }),
      Class.findAll({
        where: { nation: { [Sequelize.Op.like]: '%seeder%' } }, // 只把seeder拿進來
        raw: true        
      })
    ])
      .then(([dataTeachers, dataStudents, classDatas]) => {
        const idTeachers = dataTeachers.map(dataTeacher => dataTeacher.id)
        const idStudents = dataStudents.map(dataStudent => dataStudent.id)

        // (1) 每個students有至少 2 個 Lesson History 可以打分
        const objBeforeStudent2Scores = dataStudents.map(dataStudent => {
          let random = Math.floor(Math.random()*idTeachers.length)
          let class_id = classDatas.filter(classData => classData.teacherId === idTeachers[random])[0].id
          return {
            teacher_id: idTeachers[random],
            student_id: dataStudent.id,
            date: '2024-05-08 Wednesday',
            created_at: new Date,
            updated_at: new Date,
            time_list_id: 1, 
            oclock: '18:00 - 19:00',
            class_id,
            comment: `seeder: ${faker.lorem.text().slice(0, 20)}`,
          }
        })

        const objBeforeStudent2Scores_2nd = objBeforeStudent2Scores.map(obj => ({
          ...obj,
          time_list_id: 2, 
          oclock: '19:00 - 20:00',
        }))        
        
        // (2) 每個老師有至少 2 個過往上課評價
        const objBeforeTeacher2Comments = dataTeachers.map(dataTeacher => {
          let random = Math.floor(Math.random()*idStudents.length)
          let class_id = classDatas.filter(classData => classData.teacherId === dataTeacher.id)[0].id
          return {
            teacher_id: dataTeacher.id,
            student_id: idStudents[random],
            date: '2024-05-07 Tuesday', 
            created_at: new Date,
            updated_at: new Date,
            time_list_id: 1, 
            oclock: '18:00 - 19:00',
            class_id,
            comment: `seeder: ${faker.lorem.text().slice(0, 20)}`
          }
        })

        const objBeforeTeacher2Comments_2nd = objBeforeTeacher2Comments.map(obj => ({
          ...obj,         
          time_list_id: 2, 
          oclock: '19:00 - 20:00'
        }))     

        return Promise.all([
          queryInterface.bulkInsert('Records', objBeforeStudent2Scores, {}),
          queryInterface.bulkInsert('Records', objBeforeStudent2Scores_2nd, {}),
          queryInterface.bulkInsert('Records', objBeforeTeacher2Comments, {}),
          queryInterface.bulkInsert('Records', objBeforeTeacher2Comments_2nd, {})
        ])
      })
      .catch(err => console.error('Error in up migration: ', err))
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Records', {
      comment: { [Sequelize.Op.like]: '%seeder%' }
    })
  }
};
