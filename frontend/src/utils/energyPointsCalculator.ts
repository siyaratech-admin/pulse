export interface EnergyPointsCalculation {
  finalPoints: number
  daysDifference: number
  bonusPercentage: number // positive for bonus, negative for penalty
}

/**
 * Calculate final points with time-based bonuses/penalties
 * - Early completion: +10% per day before due date
 * - Late completion: flat -200% (applied once if missed deadline, not per-day)
 */
export function calculateFinalPoints(
  basePoints: number,
  expEndDate: string,
  expStartDate: string,
  completedOn: string
): EnergyPointsCalculation {
  if (!basePoints || !completedOn || !expEndDate || !expStartDate) {
    return { finalPoints: basePoints || 0, daysDifference: 0, bonusPercentage: 0 }
  }

  const completed = new Date(completedOn)
  const startDate = new Date(expStartDate)
  const endDate = new Date(expEndDate)

  // Use start date if completed before start
  const effectiveCompleted = completed < startDate ? startDate : completed

  // Calculate days difference (positive = late, negative = early)
  const diffMs = effectiveCompleted.getTime() - endDate.getTime()
  const daysDiff = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  let finalPoints = basePoints

  // Configurable values (easy to change later)
  const DAILY_BONUS_RATE = 0.10 // 10% per day early
  const FLAT_PENALTY_RATE = 2.0 // 200% flat penalty when missed deadline

  let bonusPercentage = 0

  if (daysDiff > 0) {
    // MISSED DEADLINE (completed AFTER expected end date)
    // Apply flat 200% penalty once (not multiplied by days late)
    finalPoints = basePoints - basePoints * FLAT_PENALTY_RATE
    bonusPercentage = -100 * FLAT_PENALTY_RATE // -200
  } else if (daysDiff < 0) {
    // Early completion: +10% per day
    const daysEarly = Math.abs(daysDiff)
    finalPoints = basePoints + basePoints * DAILY_BONUS_RATE * daysEarly
    bonusPercentage = 100 * DAILY_BONUS_RATE * daysEarly // e.g. 10% per day -> 20 for 2 days early
  } else {
    bonusPercentage = 0
  }

  return {
    finalPoints: Math.round(finalPoints * 100) / 100,
    daysDifference: daysDiff,
    bonusPercentage: Math.round(bonusPercentage * 100) / 100
  }
}

/**
 * Calculate individual distribution points from weightage percentage
 */
export function calculateDistributionPoints(
  weightage: number,
  finalPoints: number
): number {
  return Math.round((weightage / 100) * finalPoints * 100) / 100
}

/**
 * Validate that weightage percentages total to 100%
 */
export function validateWeightage(
  distribution: Array<{ weightage_: number }>
): { valid: boolean; total: number; message?: string } {
  const total = distribution.reduce((sum, row) => sum + (row.weightage_ || 0), 0)

  if (total === 0) {
    return { valid: true, total: 0 }
  }

  if (Math.abs(total - 100) > 0.01) {
    return {
      valid: false,
      total: Math.round(total * 100) / 100,
      message: `Total weightage must equal 100%. Current total: ${Math.round(total * 100) / 100}%`
    }
  }

  return { valid: true, total: 100 }
}

/**
 * Check for duplicate users in distribution
 */
export function hasDuplicateUsers(
  distribution: Array<{ user: string }>
): { hasDuplicate: boolean; duplicateUser?: string } {
  const users = new Set<string>()

  for (const row of distribution) {
    if (row.user) {
      if (users.has(row.user)) {
        return { hasDuplicate: true, duplicateUser: row.user }
      }
      users.add(row.user)
    }
  }

  return { hasDuplicate: false }
}
