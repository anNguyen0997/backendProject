'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class stats extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  stats.init({
    username: DataTypes.STRING,
    agent: DataTypes.STRING,
    gun: DataTypes.STRING,
    rank: DataTypes.STRING,
    kd: DataTypes.FLOAT,
    winRate: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'stats',
  });
  return stats;
};