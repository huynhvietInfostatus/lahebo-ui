export interface RiskSwot {
  rssId: string
  rskId: string
  content: string
  canBeSelected: boolean
  type: RiskSwotType
}

export interface AddRiskSwotPayload {
  content: string
  type: RiskSwotType
  rskId?: string
}
export interface UpdateRiskSwotPayload {
  content?: string
  type?: RiskSwotType
  rskId?: string
}

export type RiskSwotType = 'STRENGTH' | 'WEAKNESS' | 'OPPORTUNITY' | 'THREAT'

export interface RiskSwotSection {
  title: string
  type: RiskSwotType
}

export const riskSwotSections: RiskSwotSection[] = [
  {
    title: 'Strengths',
    type: 'STRENGTH'
  },
  {
    title: 'Weaknesses',
    type: 'WEAKNESS'
  },
  {
    title: 'Opportunities',
    type: 'OPPORTUNITY'
  },
  {
    title: 'Threats',
    type: 'THREAT'
  }
]
