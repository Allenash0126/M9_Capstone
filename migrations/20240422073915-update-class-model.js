'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Classes', 'teacher_id', {
      type: Sequelize.INTEGER,
      // allowNull: false, 
      references: {
        model: 'Users',
        key:'id'
      }
    });
    await queryInterface.addColumn('Classes', 'class_duration', {
      type: Sequelize.BOOLEAN
    });
    await queryInterface.addColumn('Classes', 'class_day', {
      type: Sequelize.STRING
    });
    await queryInterface.removeColumn('Classes', 'class_date'),
    await queryInterface.removeColumn('Classes', 'class_time')
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Classes', 'teacher_id');
    await queryInterface.removeColumn('Classes', 'class_duration');
    await queryInterface.removeColumn('Classes', 'class_day');
    await queryInterface.addColumn('Classes', 'class_time', {
      type: Sequelize.DATE
    }),
    await queryInterface.addColumn('Classes', 'class_date', {
      type: Sequelize.DATE
    })    
  }
};
