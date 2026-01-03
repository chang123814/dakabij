module.exports = (sequelize, DataTypes) => {
  const MaterialCategory = sequelize.define('MaterialCategory', {
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
    tableName: 'material_categories'
  })

  return MaterialCategory
}
