export enum RiskField {
  DESC = 'DESC',
  ISO = 'ISO',
  SOURCE = 'SOURCE',
  DEP = 'DEP',
  LOC = 'LOC',
  IL = 'IL',
  IC = 'IC',
  MITIGATION = 'MITIGATION',
  RL = 'RL',
  RC = 'RC',
  USER = 'USER',
  DUE_DATE = 'DUE_DATE',
  STATUS = 'STATUS',
  REMARKS = 'REMARKS'
}

export type RiskFieldStrings = keyof typeof RiskField;

export const COL_TO_FIELD = {
  'A': RiskField.DESC,
  'B': RiskField.ISO,
  'C': RiskField.SOURCE,
  'D': RiskField.DEP,
  'E': RiskField.LOC,
  'F': RiskField.IL,
  'G': RiskField.IC,
  'H': RiskField.MITIGATION,
  'I': RiskField.RL,
  'J': RiskField.RC,
  'K': RiskField.USER,
  'L': RiskField.DUE_DATE,
  'M': RiskField.STATUS,
  'N': RiskField.REMARKS
}
