export interface ResultType {
  readonly id: string
  readonly name: string
  readonly model: string
  readonly tagline: string
  readonly description: string
  readonly startup: string
  readonly lowBattery: string
  readonly care: string
  readonly warning: string
  readonly hiddenSkill: string
  readonly quote: string
}

export interface Option {
  readonly id: string
  readonly label: string
  readonly weights: Readonly<Partial<Record<string, number>>>
}

export interface Question {
  readonly id: string
  readonly title: string
  readonly options: readonly Option[]
}

export interface Quiz {
  readonly version: string
  readonly title: string
  readonly tagline: string
  readonly disclaimer: string
  readonly types: readonly ResultType[]
  readonly questions: readonly Question[]
}

export interface ScoreResult {
  version: string
  resultId: string
  scores: Record<string, number>
}
