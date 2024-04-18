'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Users', 'is_teacher', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Users', 'is_teacher', {
      type: Sequelize.BOOLEAN,
      allowNull: true
    })
  }
};
