'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Expense, {
        foreignKey: 'userId',   // a column will be added in expense table
        as: 'expenses',         // By default it wll be Expenses if we will not write it
        onDelete: 'CASCADE'     // If we delete User then its Expenses will also be deleted
      });

      User.hasMany(models.Order, {
        foreignKey: 'userId',   // a column will be added in expense table
        as: 'orders',         // By default it wll be Orders if we will not write it
        onDelete: 'CASCADE'     // If we delete User then its Order will also be deleted
      });
    }
  }
  User.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    phone: { type: DataTypes.STRING, allowNull: false, },
    password: { type: DataTypes.STRING, allowNull: false, },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = parseInt(process.env.PASSWORD_SALT || 12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = parseInt(process.env.PASSWORD_SALT || 12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });
  return User;
};