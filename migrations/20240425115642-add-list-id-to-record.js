'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Records', 'time_list_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Lists',
        key:'id'
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Records', 'time_list_id');
  }
};
