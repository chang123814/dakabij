module.exports = (sequelize, DataTypes) => {
  const Material = sequelize.define('Material', {
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
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT
    },
    materialType: {
      type: DataTypes.STRING(50),
      defaultValue: 'inspiration',
      field: 'material_type'
    },
    source: {
      type: DataTypes.STRING(200)
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      field: 'image_url'
    },
    tags: {
      type: DataTypes.STRING(500)
    },
    isFavorite: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      field: 'is_favorite'
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'view_count'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1
    }
  }, {
    tableName: 'materials'
  })

  return Material
}
