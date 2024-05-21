'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Records', 'Records_time_list_id_foreign_idx');
    await queryInterface.addConstraint('Records', {
      fields: ['time_list_id'],
      type: 'foreign key',
      name: 'Records_time_list_id_foreign_idx',
      references: {
        table: 'Lists',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });    
    await queryInterface.removeConstraint('Records', 'Records_class_id_foreign_idx');
    await queryInterface.addConstraint('Records', {
      fields: ['class_id'],
      type: 'foreign key',
      name: 'Records_class_id_foreign_idx',
      references: {
        table: 'Classes',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Records', 'Records_time_list_id_foreign_idx');
    await queryInterface.addConstraint('Records', {
      fields: ['time_list_id'],
      type: 'foreign key',
      name: 'Records_time_list_id_foreign_idx',
      references: {
        table: 'Lists',
        field: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    });    
    await queryInterface.removeConstraint('Records', 'Records_class_id_foreign_idx');
    await queryInterface.addConstraint('Records', {
      fields: ['class_id'],
      type: 'foreign key',
      name: 'Records_class_id_foreign_idx',
      references: {
        table: 'Classes',
        field: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    });
  }
};
