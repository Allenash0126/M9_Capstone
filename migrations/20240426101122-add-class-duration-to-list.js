'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Lists', 'class_duration', {
      type: Sequelize.BOOLEAN,
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Lists', 'class_duration')
  }
};
