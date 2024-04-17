'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Class extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Class.init({
    teacherName: DataTypes.STRING,
    nation: DataTypes.STRING,
    style: DataTypes.STRING,
    intro: DataTypes.STRING,
    image: DataTypes.STRING,
    scoreAvg: DataTypes.DECIMAL(2, 1),
    classTime: DataTypes.DATE,
    classDate: DataTypes.DATE,
    link: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Class',
    tableName:'Classes', 
    underscored: true,
  });
  return Class;
};