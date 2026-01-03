const { Op } = require('sequelize')
const { Habit, CheckInRecord, Material } = require('../models')
const asyncHandler = require('../utils/asyncHandler')
const { resolveOpenId } = require('../utils/requestHelpers')


const formatDate = (date) => {
  const d = new Date(date)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const getDateRange = (req) => {
  const today = new Date()
  const parseDate = (value) => {
    if (!value) return null
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d
  }

  let end = parseDate(req.query.end_date) || today
  let start = parseDate(req.query.start_date)
  if (!start) {
    start = new Date(end)
    start.setDate(end.getDate() - 6) // 默认最近 7 天
  }

  const startOfDay = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0)
  const endOfDay = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59)

  return { start: startOfDay, end: endOfDay }
}

// GET /api/statistics/achievement-rate
// 计算当前用户的习惯总体达成率和各习惯达成率
const getAchievementRate = asyncHandler(async (req, res) => {
  const openid = resolveOpenId(req)

  const habits = await Habit.findAll({
    where: { userId: openid },
    order: [['createdAt', 'DESC']]
  })

  const habitStats = habits.map(habit => {
    const target = habit.targetValue || 0
    const actual = habit.actualValue || 0
    const rate = target > 0 ? Math.round((actual / target) * 100) : 0

    return {
      habit_id: habit.id,
      habit_name: habit.name,
      target_value: target,
      actual_value: actual,
      achievement_rate: rate
    }
  })

  const totalHabits = habitStats.length
  const completedHabits = habitStats.filter(h => h.target_value > 0 && h.actual_value >= h.target_value).length

  // 总体达成率改为「所有习惯实际值 / 所有习惯目标值」的加权平均，更直观
  const totalTarget = habitStats.reduce((sum, h) => sum + (h.target_value > 0 ? h.target_value : 0), 0)
  const totalActual = habitStats.reduce((sum, h) => {
    if (h.target_value > 0) {
      // 实际值按目标值封顶，避免超额拉高整体比例
      return sum + Math.min(h.actual_value, h.target_value)
    }
    return sum
  }, 0)
  const overallRate = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0

  res.json({
    status: 'success',
    data: {
      total_habits: totalHabits,
      completed_habits: completedHabits,
      achievement_rate: overallRate,
      habits: habitStats
    }
  })
})

// GET /api/statistics/efficiency
// 基于打卡记录计算平均耗时、平均满意度、最高效时间段等
const getEfficiency = asyncHandler(async (req, res) => {
  const openid = resolveOpenId(req)
  const { start, end } = getDateRange(req)

  const [records, habits] = await Promise.all([
    CheckInRecord.findAll({
      where: {
        userId: openid,
        completionTime: {
          [Op.between]: [start, end]
        }
      }
    }),
    Habit.findAll({ where: { userId: openid } })
  ])

  if (!records.length) {
    return res.json({
      status: 'success',
      data: {
        average_time_spent: 0,
        average_satisfaction: 0,
        most_efficient_time_slot: null,
        most_efficient_time_slot_text: '暂无数据',
        total_check_ins: 0,
        habits: []
      }
    })
  }

  const habitMap = habits.reduce((map, h) => {
    map[h.id] = h
    return map
  }, {})

  let totalTime = 0
  let timeCount = 0
  let totalSatisfaction = 0
  let satisfactionCount = 0

  const slotCounts = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    other: 0
  }

  const habitStatsMap = {}

  records.forEach(r => {
    // 时间与满意度
    if (typeof r.timeSpent === 'number' && r.timeSpent > 0) {
      totalTime += r.timeSpent
      timeCount += 1
    }
    if (typeof r.satisfactionScore === 'number' && r.satisfactionScore > 0) {
      totalSatisfaction += r.satisfactionScore
      satisfactionCount += 1
    }

    // 时间段统计（优先用完成时间）
    let slot = 'other'
    if (r.completionTime) {
      const hour = new Date(r.completionTime).getHours()
      if (hour >= 5 && hour < 12) slot = 'morning'
      else if (hour >= 12 && hour < 18) slot = 'afternoon'
      else slot = 'evening'
    } else {
      const habit = habitMap[r.habitId]
      if (habit && habit.timeSlot) {
        slot = habit.timeSlot
      }
    }
    if (!slotCounts[slot]) slotCounts[slot] = 0
    slotCounts[slot] += 1

    // 按习惯统计
    const key = String(r.habitId)
    if (!habitStatsMap[key]) {
      const habit = habitMap[r.habitId]
      habitStatsMap[key] = {
        habit_id: r.habitId,
        habit_name: habit ? habit.name : `习惯 ${r.habitId}`,
        check_in_count: 0,
        total_time_spent: 0,
        time_count: 0,
        total_satisfaction: 0,
        satisfaction_count: 0
      }
    }
    const stat = habitStatsMap[key]
    stat.check_in_count += 1
    if (typeof r.timeSpent === 'number' && r.timeSpent > 0) {
      stat.total_time_spent += r.timeSpent
      stat.time_count += 1
    }
    if (typeof r.satisfactionScore === 'number' && r.satisfactionScore > 0) {
      stat.total_satisfaction += r.satisfactionScore
      stat.satisfaction_count += 1
    }
  })

  const averageTimeSpent = timeCount ? Math.round(totalTime / timeCount) : 0
  const averageSatisfaction = satisfactionCount ? Number((totalSatisfaction / satisfactionCount).toFixed(1)) : 0

  // 最高效时间段：取打卡次数最多的时间段
  const slotLabels = {
    morning: '上午',
    afternoon: '下午',
    evening: '晚上',
    other: '其它时段'
  }
  let bestSlot = null
  let bestCount = 0
  Object.keys(slotCounts).forEach(key => {
    if (slotCounts[key] > bestCount) {
      bestCount = slotCounts[key]
      bestSlot = key
    }
  })

  const habitsStats = Object.values(habitStatsMap)
    .map(stat => ({
      habit_id: stat.habit_id,
      habit_name: stat.habit_name,
      check_in_count: stat.check_in_count,
      average_time_spent: stat.time_count ? Math.round(stat.total_time_spent / stat.time_count) : 0,
      average_satisfaction: stat.satisfaction_count
        ? Number((stat.total_satisfaction / stat.satisfaction_count).toFixed(1))
        : 0
    }))
    // 默认按打卡次数从高到低排序
    .sort((a, b) => b.check_in_count - a.check_in_count)

  res.json({
    status: 'success',
    data: {
      average_time_spent: averageTimeSpent,
      average_satisfaction: averageSatisfaction,
      most_efficient_time_slot: bestSlot,
      most_efficient_time_slot_text: bestSlot ? slotLabels[bestSlot] : '暂无数据',
      total_check_ins: records.length,
      habits: habitsStats
    }
  })
})

// GET /api/statistics/trend
// 返回一段时间内每日打卡次数趋势
const getTrend = asyncHandler(async (req, res) => {
  const openid = resolveOpenId(req)
  const { start, end } = getDateRange(req)

  const records = await CheckInRecord.findAll({
    where: {
      userId: openid,
      completionTime: {
        [Op.between]: [start, end]
      }
    },
    order: [['completionTime', 'ASC']]
  })

  // 构造日期列表
  const dates = []
  const counts = {}
  let cursor = new Date(start)
  const endDate = new Date(end)

  while (cursor <= endDate) {
    const key = formatDate(cursor)
    dates.push(key)
    counts[key] = 0
    cursor.setDate(cursor.getDate() + 1)
  }

  records.forEach(r => {
    const d = r.checkInDate ? formatDate(r.checkInDate) : (r.completionTime ? formatDate(r.completionTime) : null)
    if (d && counts[d] !== undefined) {
      counts[d] += 1
    }
  })

  const trend = dates.map(date => ({
    date,
    value: counts[date] || 0
  }))

  const values = trend.map(t => t.value)
  const total = values.reduce((sum, v) => sum + v, 0)
  const average = values.length ? Number((total / values.length).toFixed(1)) : 0
  const max = values.length ? Math.max(...values) : 0
  const min = values.length ? Math.min(...values) : 0

  let growthRate = 0
  if (values.length >= 2) {
    const first = values[0]
    const last = values[values.length - 1]
    if (first > 0) {
      growthRate = Number((((last - first) / first) * 100).toFixed(1))
    } else if (last > 0) {
      growthRate = 100
    }
  }

  res.json({
    status: 'success',
    data: {
      metric: 'check_ins',
      trend,
      average,
      max,
      min,
      growth_rate: growthRate
    }
  })
})

// GET /api/statistics/materials
// 素材统计：数量、类型分布、标签使用频率等
const getMaterialStatistics = asyncHandler(async (req, res) => {
  const openid = resolveOpenId(req)

  const materials = await Material.findAll({
    where: { userId: openid, status: 1 },
    order: [['updatedAt', 'DESC']]
  })

  if (!materials.length) {
    return res.json({
      status: 'success',
      data: {
        total_count: 0,
        favorite_count: 0,
        image_count: 0,
        type_distribution: [],
        top_tags: [],
        recent_materials: []
      }
    })
  }

  const typeMap = {}
  let favoriteCount = 0
  let imageCount = 0
  const tagMap = {}

  materials.forEach(m => {
    const type = m.materialType || 'unknown'
    typeMap[type] = (typeMap[type] || 0) + 1
    if (m.isFavorite) favoriteCount += 1
    if (m.imageUrl) imageCount += 1

    if (m.tags) {
      const tags = String(m.tags)
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)
      tags.forEach(tag => {
        tagMap[tag] = (tagMap[tag] || 0) + 1
      })
    }
  })

  const typeDistribution = Object.keys(typeMap).map(key => ({
    material_type: key,
    count: typeMap[key]
  }))

  const topTags = Object.keys(tagMap)
    .map(key => ({ tag: key, count: tagMap[key] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const recentMaterials = materials.slice(0, 5).map(m => ({
    id: m.id,
    title: m.title,
    material_type: m.materialType,
    is_favorite: m.isFavorite,
    created_at: m.createdAt,
    updated_at: m.updatedAt
  }))

  res.json({
    status: 'success',
    data: {
      total_count: materials.length,
      favorite_count: favoriteCount,
      image_count: imageCount,
      type_distribution: typeDistribution,
      top_tags: topTags,
      recent_materials: recentMaterials
    }
  })
})

// GET /api/statistics/compare
// 对比两个时间区间的打卡表现
const getCompare = asyncHandler(async (req, res) => {
  const openid = resolveOpenId(req)

  const parseDate = (value) => {
    if (!value) return null
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d
  }

  // 当前区间
  const today = new Date()
  const endInput = parseDate(req.query.end_date) || today
  const startInput = parseDate(req.query.start_date)
  let currentStart = startInput || new Date(endInput.getFullYear(), endInput.getMonth(), endInput.getDate() - 6)
  let currentEnd = endInput

  currentStart = new Date(currentStart.getFullYear(), currentStart.getMonth(), currentStart.getDate(), 0, 0, 0)
  currentEnd = new Date(currentEnd.getFullYear(), currentEnd.getMonth(), currentEnd.getDate(), 23, 59, 59)

  const dayMs = 24 * 60 * 60 * 1000
  const rangeDays = Math.max(1, Math.round((currentEnd - currentStart) / dayMs) + 1)

  // 对比区间：如果传 compare_start_date/compare_end_date 就用传入的，否则向前平移同样天数
  let previousStart
  let previousEnd

  const compareStartInput = parseDate(req.query.compare_start_date)
  const compareEndInput = parseDate(req.query.compare_end_date)

  if (compareStartInput && compareEndInput) {
    previousStart = new Date(compareStartInput.getFullYear(), compareStartInput.getMonth(), compareStartInput.getDate(), 0, 0, 0)
    previousEnd = new Date(compareEndInput.getFullYear(), compareEndInput.getMonth(), compareEndInput.getDate(), 23, 59, 59)
  } else {
    previousEnd = new Date(currentStart.getTime() - dayMs)
    previousStart = new Date(previousEnd.getTime() - (rangeDays - 1) * dayMs)
    previousStart = new Date(previousStart.getFullYear(), previousStart.getMonth(), previousStart.getDate(), 0, 0, 0)
    previousEnd = new Date(previousEnd.getFullYear(), previousEnd.getMonth(), previousEnd.getDate(), 23, 59, 59)
  }

  const [currentRecords, previousRecords] = await Promise.all([
    CheckInRecord.findAll({
      where: {
        userId: openid,
        completionTime: {
          [Op.between]: [currentStart, currentEnd]
        }
      }
    }),
    CheckInRecord.findAll({
      where: {
        userId: openid,
        completionTime: {
          [Op.between]: [previousStart, previousEnd]
        }
      }
    })
  ])

  const summarize = (records, days) => {
    if (!records.length) {
      return {
        total_check_ins: 0,
        average_per_day: 0,
        average_time_spent: 0,
        average_satisfaction: 0
      }
    }

    let totalTime = 0
    let timeCount = 0
    let totalSatisfaction = 0
    let satisfactionCount = 0

    records.forEach(r => {
      if (typeof r.timeSpent === 'number' && r.timeSpent > 0) {
        totalTime += r.timeSpent
        timeCount += 1
      }
      if (typeof r.satisfactionScore === 'number' && r.satisfactionScore > 0) {
        totalSatisfaction += r.satisfactionScore
        satisfactionCount += 1
      }
    })

    const totalCheckIns = records.length

    return {
      total_check_ins: totalCheckIns,
      average_per_day: Number((totalCheckIns / days).toFixed(1)),
      average_time_spent: timeCount ? Math.round(totalTime / timeCount) : 0,
      average_satisfaction: satisfactionCount ? Number((totalSatisfaction / satisfactionCount).toFixed(1)) : 0
    }
  }

  const currentSummary = summarize(currentRecords, rangeDays)

  const previousDays = Math.max(1, Math.round((previousEnd - previousStart) / dayMs) + 1)
  const previousSummary = summarize(previousRecords, previousDays)

  const growthRate = (currentValue, previousValue) => {
    if (previousValue > 0) {
      return Number((((currentValue - previousValue) / previousValue) * 100).toFixed(1))
    }
    if (currentValue > 0 && previousValue === 0) {
      return 100
    }
    return 0
  }

  const growth = {
    total_check_ins: growthRate(currentSummary.total_check_ins, previousSummary.total_check_ins),
    average_per_day: growthRate(currentSummary.average_per_day, previousSummary.average_per_day),
    average_time_spent: growthRate(currentSummary.average_time_spent, previousSummary.average_time_spent),
    average_satisfaction: growthRate(currentSummary.average_satisfaction, previousSummary.average_satisfaction)
  }

  res.json({
    status: 'success',
    data: {
      current_period: {
        start_date: formatDate(currentStart),
        end_date: formatDate(currentEnd),
        ...currentSummary
      },
      previous_period: {
        start_date: formatDate(previousStart),
        end_date: formatDate(previousEnd),
        ...previousSummary
      },
      growth
    }
  })
})

module.exports = {
  getAchievementRate,
  getEfficiency,
  getTrend,
  getMaterialStatistics,
  getCompare
}


