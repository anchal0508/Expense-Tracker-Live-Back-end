'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class forgotPass extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      forgotPass.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      })
    }
  }
  forgotPass.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // 'Users' Table name (Plural)
        key: 'id'       // Users Table id (primary Key)
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    isActive: DataTypes.BOOLEAN,
    expireBy: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'forgotPass',
    tableName: 'forgotPasses',
    timestamps: true
  });
  return forgotPass;
};