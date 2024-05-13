'use strict';
const faker = require('faker')
const bcrypt = require('bcryptjs')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [{
      name: 'root',
      email: 'root@example.com',
      // password: await bcrypt.hash('12345678', 10),
      password: bcrypt.hashSync('12345678', 10),
      intro: faker.lorem.text().slice(0, 20),
      image: `https://loremflickr.com/320/240/cat/?random=${Math.random() * 100}`,
      is_teacher: false,
      nation: 'Japan seeder',
      created_at: new Date,
      updated_at: new Date      
    }], {}),
    await queryInterface.bulkInsert('Users', 
      Array.from({ length: 5 }, (n, i) => ({
        name: `user${i + 1}`,
        email: `user${i + 1}@example.com`,
        password: bcrypt.hashSync('12345678', 10),
        intro: faker.lorem.text().slice(0, 20),
        image: `https://loremflickr.com/320/240/dog/?random=${Math.random() * 100}`,
        is_teacher: false,
        nation: 'Taiwan seeder',
        created_at: new Date,
        updated_at: new Date
      }))  
    ),
    await queryInterface.bulkInsert('Users',
      Array.from({ length: 10 }, (n, i) => ({
        name: faker.name.findName(),
        email: `teacher${i + 1}@example.com`,
        password: bcrypt.hashSync('12345678', 10),
        intro: faker.lorem.text().slice(0, 20),
        image: `https://loremflickr.com/320/240/cat/?random=${Math.random() * 100}`,
        is_teacher: true,
        nation: 'USA seeder',
        created_at: new Date,
        updated_at: new Date
      }))    
    )

  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', {
      nation: { [Sequelize.Op.like]: '%seeder%' }
    })
  }
};
