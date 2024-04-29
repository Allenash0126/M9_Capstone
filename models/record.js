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
      Record.belongsTo(models.List, { foreignKey: 'timeListId' }),
      Record.belongsTo(models.Class, { foreignKey: 'classId' })
    }
  }
  Record.init({
    teacherId: DataTypes.INTEGER,
    studentId: DataTypes.INTEGER,
    timeListId: DataTypes.INTEGER,
    score: DataTypes.INTEGER,    
    comment: DataTypes.STRING,
    date: DataTypes.STRING,
    oclock: DataTypes.STRING,
    classId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Record',
    tableName: 'Records',
    underscored: true,
  });
  return Record;
};