'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Classes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      teacher_name: {
        type: Sequelize.STRING
      },
      nation: {
        type: Sequelize.STRING
      },
      style: {
        type: Sequelize.STRING
      },
      intro: {
        type: Sequelize.STRING
      },
      image: {
        type: Sequelize.STRING
      },
      score_avg: {
        type: Sequelize.DECIMAL(2, 1)
      },
      class_time: {
        type: Sequelize.DATE
      },
      class_date: {
        type: Sequelize.DATE
      },            
      link: {
        type: Sequelize.STRING
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Class');
  }
};