'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Lists', 'time_list', 'oclock'),
    await queryInterface.renameColumn('Lists', 'class_duration', 'duration30or60'),
    await queryInterface.renameColumn('Classes', 'class_duration', 'duration30or60'),
    await queryInterface.renameColumn('Records', 'class_date', 'date'),
    await queryInterface.removeColumn('Records', 'class_duration'),
    await queryInterface.addColumn('Records', 'oclock', { type: Sequelize.STRING }),
    await queryInterface.addColumn('Records', 'class_id', { 
      type: Sequelize.INTEGER,
      references: {
        model: 'Classes',
        key:'id'
      }      
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Lists', 'oclock', 'time_list'),
    await queryInterface.renameColumn('Lists', 'duration30or60', 'class_duration'),
    await queryInterface.renameColumn('Classes', 'duration30or60', 'class_duration'),
    await queryInterface.renameColumn('Records', 'date', 'class_date'),
    await queryInterface.addColumn('Records', 'class_duration', { type: Sequelize.INTEGER }),
    await queryInterface.removeColumn('Records', 'oclock'),
    await queryInterface.removeColumn('Records', 'class_id')
  }
};
