export type WorkArea = "Butik" | "Lager" | "E-handel"

export interface SalaryCalculationParams {
  workArea: WorkArea
  date: Date
  startTime: string
  endTime: string
  breakMinutes: number
  baseWage: number
  taxRate: number
}

export interface TimeSegment {
  start: Date
  end: Date
  obPercentage: number
  type: string
}

export interface SalaryResult {
  grossSalary: number
  netSalary: number
  totalHours: number
  basePay: number
  obBreakdown: {
    type: string
    amount: number
    percentage: number
    hours: number
  }[]
}
