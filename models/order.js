// 5
// Shree

'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Order.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      })
    }
  }
  Order.init({
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
    paymentid: DataTypes.STRING,
    orderid: DataTypes.STRING,
    status: {
      type: DataTypes.STRING,
      defaultValue: 'PENDING'
    }
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'Orders',
    timestamps: true
  });
  return Order;
};