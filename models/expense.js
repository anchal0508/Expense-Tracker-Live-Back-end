'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Expense extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Expense.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      })
    }
  }
  Expense.init({
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
    expenseOn: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    totalAmount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    income: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'Expense',
    tableName: 'Expenses',
    timestamps: true
  });
  return Expense;
};