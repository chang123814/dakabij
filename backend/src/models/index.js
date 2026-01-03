const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const TaskCategory = require('./taskCategory')(sequelize, DataTypes)
const MaterialCategory = require('./materialCategory')(sequelize, DataTypes)
const Material = require('./material')(sequelize, DataTypes)
const Habit = require('./habit')(sequelize, DataTypes)
const CheckInRecord = require('./checkInRecord')(sequelize, DataTypes)
const Tag = require('./tag')(sequelize, DataTypes)
const Note = require('./note')(sequelize, DataTypes)


Material.belongsTo(MaterialCategory, { as: 'category', foreignKey: 'categoryId' })
MaterialCategory.hasMany(Material, { as: 'materials', foreignKey: 'categoryId' })

Habit.hasMany(CheckInRecord, { as: 'checkIns', foreignKey: 'habitId' })
CheckInRecord.belongsTo(Habit, { as: 'habit', foreignKey: 'habitId' })

module.exports = {
  sequelize,
  TaskCategory,
  MaterialCategory,
  Material,
  Habit,
  CheckInRecord,
  Tag,
  Note
}
