'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Lists', [{
      oclock: '18:00 - 19:00', 
      created_at: new Date,
      updated_at: new Date,
      duration30or60: 1
    },{
      oclock: '19:00 - 20:00', 
      created_at: new Date,
      updated_at: new Date,
      duration30or60: 1
    },
    {
      oclock: '20:00 - 21:00', 
      created_at: new Date,
      updated_at: new Date,
      duration30or60: 1
    },
    {
      oclock: '18:00 - 18:30', 
      created_at: new Date,
      updated_at: new Date,
      duration30or60: 0
    },
    {
      oclock: '18:30 - 19:00', 
      created_at: new Date,
      updated_at: new Date,
      duration30or60: 0
    },
    {
      oclock: '19:00 - 19:30', 
      created_at: new Date,
      updated_at: new Date,
      duration30or60: 0
    },
    {
      oclock: '19:30 - 20:00', 
      created_at: new Date,
      updated_at: new Date,
      duration30or60: 0
    },
    {
      oclock: '20:00 - 20:30', 
      created_at: new Date,
      updated_at: new Date,
      duration30or60: 0
    },
    {
      oclock: '20:30 - 21:00', 
      created_at: new Date,
      updated_at: new Date,
      duration30or60: 0
    }], {})
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Lists', {})
  }
};
