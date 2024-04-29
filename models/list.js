'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class List extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      List.hasMany(models.Record, { foreignKey: 'timeListId' })
    }
  }
  List.init({
    oclock: DataTypes.STRING,
    duration30or60: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'List',
    tablelName: 'Lists',
    underscored: true,
  });
  return List;
};