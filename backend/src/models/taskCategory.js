module.exports = (sequelize, DataTypes) => {
  const TaskCategory = sequelize.define('TaskCategory', {
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'user_id'
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    icon: {
      type: DataTypes.STRING(50)
    },
    color: {
      type: DataTypes.STRING(20)
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'sort_order'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1
    }
  }, {
    tableName: 'task_categories'
  })

  return TaskCategory
}
