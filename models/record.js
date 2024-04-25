'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Record extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Record.belongsTo(models.User, { foreignKey: 'teacherId' }),
      Record.belongsTo(models.User, { foreignKey: 'studentId' }),
      Record.belongsTo(models.List, { foreignKey: 'timeListId' })
    }
  }
  Record.init({
    teacherId: DataTypes.INTEGER,
    studentId: DataTypes.INTEGER,
    listId: DataTypes.INTEGER,
    score: DataTypes.INTEGER,    
    comment: DataTypes.STRING,
    classDate: DataTypes.STRING,
    classDuration: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Record',
    tableName: 'Records',
    underscored: true,
  });
  return Record;
};