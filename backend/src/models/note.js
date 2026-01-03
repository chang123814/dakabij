module.exports = (sequelize, DataTypes) => {
  const Note = sequelize.define('Note', {
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
    noteType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'general',
      field: 'note_type'
    },
    tags: {
      type: DataTypes.STRING(500)
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
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1
    }
  }, {
    tableName: 'notes'
  })

  return Note
}
