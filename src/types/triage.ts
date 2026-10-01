export type TriageCategory = 'RED_RESUSCITATION' | 'ORANGE_EMERGENT' | 'YELLOW_URGENT' | 'GREEN_LESS_URGENT' | 'BLUE_NON_URGENT';

export interface SymptomGuide {
  id: string;
  name: string;
  category: TriageCategory;
  urgencyLabel: string;
  actionRequired: string;
  goldenHourWindowMinutes?: number;
  criticalIndicators: string[];
  firstAidAdvice: string[];
}

export interface EmergencyHelpline {
  number: string;
  name: string;
  service: string;
  coverage: string;
  tollFree: boolean;
}
