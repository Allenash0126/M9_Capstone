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
      teacher_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key:'id'
        }
      },
      teacher_name: {
        type: Sequelize.STRING
      },      
      class_duration: {
        type: Sequelize.BOOLEAN
      },   
      class_day: {
        type: Sequelize.JSON
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
    await queryInterface.dropTable('Classes');
  }
};