import type { SalaryCalculationParams, SalaryResult, TimeSegment, WorkArea } from "./types"

// Public holidays for 2025
const publicHolidays2025 = [
  new Date(2025, 0, 1), // Nyårsdagen
  new Date(2025, 0, 6), // Trettondagen
  new Date(2025, 3, 18), // Långfredag
  new Date(2025, 3, 20), // Påskdagen
  new Date(2025, 3, 21), // Annandag påsk
  new Date(2025, 4, 1), // Första maj
  new Date(2025, 4, 29), // Kristi himmelsfärds dag
  new Date(2025, 5, 8), // Pingstdagen
  new Date(2025, 5, 6), // Nationaldagen
  new Date(2025, 5, 21), // Midsommardagen
  new Date(2025, 10, 1), // Alla helgons dag
  new Date(2025, 11, 25), // Juldagen
  new Date(2025, 11, 26), // Annandag jul
]

// Special eve days
const easterEve2025 = new Date(2025, 3, 19) // Påskafton
const midsummerEve2025 = new Date(2025, 5, 20) // Midsommarafton
const christmasEve2025 = new Date(2025, 11, 24) // Julafton
const newYearsEve2025 = new Date(2025, 11, 31) // Nyårsafton

// Check if a date is a public holiday
function isPublicHoliday(date: Date): boolean {
  return publicHolidays2025.some(
    (holiday) =>
      holiday.getFullYear() === date.getFullYear() &&
      holiday.getMonth() === date.getMonth() &&
      holiday.getDate() === date.getDate(),
  )
}

// Check if a date is a special eve day
function isEveDay(date: Date): boolean {
  const eveDays = [easterEve2025, midsummerEve2025, christmasEve2025, newYearsEve2025]
  return eveDays.some(
    (eveDay) =>
      eveDay.getFullYear() === date.getFullYear() &&
      eveDay.getMonth() === date.getMonth() &&
      eveDay.getDate() === date.getDate(),
  )
}

// Check which specific eve day it is
function getEveDay(date: Date): string | null {
  if (
    date.getFullYear() === easterEve2025.getFullYear() &&
    date.getMonth() === easterEve2025.getMonth() &&
    date.getDate() === easterEve2025.getDate()
  ) {
    return "Påskafton"
  }
  if (
    date.getFullYear() === midsummerEve2025.getFullYear() &&
    date.getMonth() === midsummerEve2025.getMonth() &&
    date.getDate() === midsummerEve2025.getDate()
  ) {
    return "Midsommarafton"
  }
  if (
    date.getFullYear() === christmasEve2025.getFullYear() &&
    date.getMonth() === christmasEve2025.getMonth() &&
    date.getDate() === christmasEve2025.getDate()
  ) {
    return "Julafton"
  }
  if (
    date.getFullYear() === newYearsEve2025.getFullYear() &&
    date.getMonth() === newYearsEve2025.getMonth() &&
    date.getDate() === newYearsEve2025.getDate()
  ) {
    return "Nyårsafton"
  }
  return null
}

// Get OB segments based on work area and date
function getObSegments(workArea: WorkArea, date: Date): TimeSegment[] {
  const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const segments: TimeSegment[] = []

  // Check if it's a public holiday
  if (isPublicHoliday(date)) {
    // For all work areas, public holidays have 100% OB for the entire day
    segments.push({
      start: new Date(date.setHours(0, 0, 0, 0)),
      end: new Date(date.setHours(23, 59, 59, 999)),
      obPercentage: 100,
      type: "Helgdag",
    })
    return segments
  }

  // Handle special eve days
  const eveDay = getEveDay(date)
  if (eveDay) {
    if (workArea === "Butik") {
      // For Butik, treat eve days as Saturdays
      return getObSegmentsForButikSaturday(date)
    } else {
      // For Lager and E-handel
      if (eveDay === "Påskafton") {
        // Treat Easter Eve as a normal Saturday
        return getObSegmentsForLagerEhandelSaturday(date)
      } else {
        // Treat other eve days as normal Fridays
        return getObSegmentsForLagerEhandelWeekday(date)
      }
    }
  }

  // Regular days
  if (workArea === "Butik") {
    if (dayOfWeek === 0) {
      // Sunday
      segments.push({
        start: new Date(date.setHours(0, 0, 0, 0)),
        end: new Date(date.setHours(23, 59, 59, 999)),
        obPercentage: 100,
        type: "OB Söndag",
      })
    } else if (dayOfWeek === 6) {
      // Saturday
      return getObSegmentsForButikSaturday(date)
    } else {
      // Monday-Friday
      segments.push({
        start: new Date(date.setHours(18, 15, 0, 0)),
        end: new Date(date.setHours(20, 0, 0, 0)),
        obPercentage: 50,
        type: "OB Kväll (50%)",
      })
      segments.push({
        start: new Date(date.setHours(20, 0, 0, 0)),
        end: new Date(new Date(date).setHours(24 + 6, 0, 0, 0)), // Next day 06:00
        obPercentage: 70,
        type: "OB Natt (70%)",
      })
    }
  } else {
    // Lager and E-handel
    if (dayOfWeek === 0) {
      // Sunday
      segments.push({
        start: new Date(date.setHours(0, 0, 0, 0)),
        end: new Date(date.setHours(23, 59, 59, 999)),
        obPercentage: 100,
        type: "OB Söndag",
      })
    } else if (dayOfWeek === 6) {
      // Saturday
      return getObSegmentsForLagerEhandelSaturday(date)
    } else {
      // Monday-Friday
      return getObSegmentsForLagerEhandelWeekday(date)
    }
  }

  return segments
}

// Helper function for Butik Saturday OB segments
function getObSegmentsForButikSaturday(date: Date): TimeSegment[] {
  const segments: TimeSegment[] = []
  segments.push({
    start: new Date(date.setHours(12, 0, 0, 0)),
    end: new Date(date.setHours(23, 59, 59, 999)),
    obPercentage: 100,
    type: "OB Lördag (100%)",
  })
  return segments
}

// Helper function for Lager/E-handel Saturday OB segments
function getObSegmentsForLagerEhandelSaturday(date: Date): TimeSegment[] {
  const segments: TimeSegment[] = []
  segments.push({
    start: new Date(date.setHours(0, 0, 0, 0)),
    end: new Date(date.setHours(6, 0, 0, 0)),
    obPercentage: 70,
    type: "OB Natt (70%)",
  })
  segments.push({
    start: new Date(date.setHours(6, 0, 0, 0)),
    end: new Date(date.setHours(23, 0, 0, 0)),
    obPercentage: 40,
    type: "OB Lördag (40%)",
  })
  segments.push({
    start: new Date(date.setHours(23, 0, 0, 0)),
    end: new Date(date.setHours(23, 59, 59, 999)),
    obPercentage: 70,
    type: "OB Natt (70%)",
  })
  return segments
}

// Helper function for Lager/E-handel weekday OB segments
function getObSegmentsForLagerEhandelWeekday(date: Date): TimeSegment[] {
  const segments: TimeSegment[] = []
  const dayOfWeek = date.getDay()

  if (dayOfWeek === 1) {
    // Monday has special handling for the first hours
    segments.push({
      start: new Date(date.setHours(0, 0, 0, 0)),
      end: new Date(date.setHours(6, 0, 0, 0)),
      obPercentage: 70,
      type: "OB Natt (70%)",
    })
  }

  segments.push({
    start: new Date(date.setHours(6, 0, 0, 0)),
    end: new Date(date.setHours(7, 0, 0, 0)),
    obPercentage: 40,
    type: "OB Morgon (40%)",
  })

  segments.push({
    start: new Date(date.setHours(18, 0, 0, 0)),
    end: new Date(date.setHours(23, 0, 0, 0)),
    obPercentage: 40,
    type: "OB Kväll (40%)",
  })

  segments.push({
    start: new Date(date.setHours(23, 0, 0, 0)),
    end: new Date(new Date(date).setHours(24 + 6, 0, 0, 0)), // Next day 06:00
    obPercentage: 70,
    type: "OB Natt (70%)",
  })

  return segments
}

// Calculate the overlap between two time ranges in hours
function calculateOverlapHours(start1: Date, end1: Date, start2: Date, end2: Date): number {
  const overlapStart = new Date(Math.max(start1.getTime(), start2.getTime()))
  const overlapEnd = new Date(Math.min(end1.getTime(), end2.getTime()))

  if (overlapEnd <= overlapStart) {
    return 0
  }

  return (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60)
}

// Main calculation function
export function calculateSalary(params: SalaryCalculationParams): SalaryResult {
  const { workArea, date, startTime, endTime, breakMinutes, baseWage, taxRate } = params

  // Parse start and end times
  const [startHour, startMinute] = startTime.split(":").map(Number)
  const [endHour, endMinute] = endTime.split(":").map(Number)

  // Create Date objects for start and end times
  const startDate = new Date(date)
  startDate.setHours(startHour, startMinute, 0, 0)

  const endDate = new Date(date)
  // Handle shifts crossing midnight
  if (endHour < startHour || (endHour === startHour && endMinute < startMinute)) {
    endDate.setDate(endDate.getDate() + 1)
  }
  endDate.setHours(endHour, endMinute, 0, 0)

  // Calculate total hours worked (excluding break)
  const totalHoursWithBreak = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
  const totalHours = totalHoursWithBreak - breakMinutes / 60

  // Calculate base pay
  const basePay = totalHours * baseWage

  // Get OB segments for the work day
  const obSegments = getObSegments(workArea, new Date(date))

  // Calculate OB pay for each segment
  const obBreakdown: SalaryResult["obBreakdown"] = []
  let totalObPay = 0

  for (const segment of obSegments) {
    const overlapHours = calculateOverlapHours(startDate, endDate, segment.start, segment.end)

    if (overlapHours > 0) {
      const obAmount = overlapHours * baseWage * (segment.obPercentage / 100)
      totalObPay += obAmount

      obBreakdown.push({
        type: segment.type,
        amount: obAmount,
        percentage: segment.obPercentage,
        hours: overlapHours,
      })
    }
  }

  // Calculate gross and net salary
  const grossSalary = basePay + totalObPay
  const netSalary = grossSalary * (1 - taxRate / 100)

  return {
    grossSalary,
    netSalary,
    totalHours,
    basePay,
    obBreakdown,
  }
}
