module.exports = (sequelize, DataTypes) => {
  const Habit = sequelize.define('Habit', {
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'user_id'
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'category_id'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    targetValue: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'target_value'
    },
    actualValue: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'actual_value'
    },
    timeSlot: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'time_slot'
    },
    tags: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    priority: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1
    },
    isTemplate: {
      type: DataTypes.TINYINT,
      allowNull: true,
      field: 'is_template'
    },
    templateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'template_id'
    }
  }, {
    tableName: 'habits'
  })

  return Habit
}
