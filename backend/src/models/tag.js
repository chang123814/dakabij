module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define('Tag', {
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'user_id'
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    color: {
      type: DataTypes.STRING(20)
    },
    tagType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'material',
      field: 'tag_type'
    },
    usageCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'usage_count'
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    tableName: 'tags'
  })

  return Tag
}
