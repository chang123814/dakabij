module.exports = (sequelize, DataTypes) => {
  const CheckInRecord = sequelize.define('CheckInRecord', {
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'user_id'
    },
    habitId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'habit_id'
    },
    checkInDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'check_in_date'
    },
    completed: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    completionNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'completion_notes'
    },
    satisfactionScore: {
      type: DataTypes.TINYINT,
      allowNull: true,
      field: 'satisfaction_score'
    },
    timeSpent: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'time_spent'
    },
    completionTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'completion_time'
    }
  }, {
    tableName: 'check_in_records'
  })

  return CheckInRecord
}
