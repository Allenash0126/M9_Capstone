'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Class, { foreignKey: 'teacherId' }),
      User.hasMany(models.Record, { foreignKey: 'teacherId' }),
      User.hasMany(models.Record, { foreignKey: 'studentId' })
    }
  }
  User.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    intro: DataTypes.STRING,
    image: DataTypes.STRING,
    isTeacher: DataTypes.BOOLEAN,
    totalClassTime: DataTypes.INTEGER,
    nation: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
    tableName:'Users', 
    underscored: true,
  });
  return User;
};