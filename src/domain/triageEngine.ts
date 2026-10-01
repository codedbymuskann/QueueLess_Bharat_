/**
 * QueueLess Bharat — Medical Triage & Clinical Urgency Engine
 * Formulated from the clinical perspective of a Hospital Director & Health Instructor.
 * Provides emergency severity index (ESI) guidance and immediate action protocols.
 */

import { SymptomGuide } from '../types/triage';

export class TriageEngine {
  public static readonly SYMPTOM_PROTOCOLS: SymptomGuide[] = [
    {
      id: 'cardiac-chest-pain',
      name: 'Crushing Chest Pain / Suspected Heart Attack',
      category: 'RED_RESUSCITATION',
      urgencyLabel: 'Level 1: Immediate Resuscitation',
      actionRequired: 'Call 108 Emergency Ambulance Immediately. Do not drive yourself. Locate nearest hospital with 24x7 Cath Lab / ICU.',
      goldenHourWindowMinutes: 60,
      criticalIndicators: [
        'Pain radiating to left arm, neck, or jaw',
        'Cold diaphoresis (profuse sweating) & nausea',
        'Shortness of breath with chest tightness',
        'Feeling of imminent doom or crushing pressure'
      ],
      firstAidAdvice: [
        'Keep patient seated upright in comfortable position (W-position)',
        'Loosen restrictive neckwear and clothing',
        'If advised by emergency physician on phone and not allergic, chew 300mg Soluble Aspirin',
        'Do not give liquid fluids or heavy food'
      ]
    },
    {
      id: 'stroke-fast',
      name: 'Acute Stroke Symptoms (FAST Protocol)',
      category: 'RED_RESUSCITATION',
      urgencyLabel: 'Level 1: Critical Neuro-Emergency',
      actionRequired: 'Target a Stroke-Ready Hospital with 24x7 CT Scan & Thrombolysis capabilities within 3 to 4.5 hours window.',
      goldenHourWindowMinutes: 90,
      criticalIndicators: [
        'F - Face Drooping (one side of face droops when smiling)',
        'A - Arm Weakness (one arm drifts downward when raised)',
        'S - Speech Difficulty (slurred speech or inability to repeat simple sentence)',
        'T - Time to Call 108 / Rush to Stroke Center'
      ],
      firstAidAdvice: [
        'Note the exact time symptoms were first noticed',
        'Do NOT administer aspirin or blood thinners until hemorrhagic stroke is ruled out by CT scan',
        'Lay patient on side with head slightly elevated (recovery position) if vomiting',
        'Check airway clearance and stay by their side'
      ]
    },
    {
      id: 'severe-trauma',
      name: 'Major Trauma / Road Traffic Accident / Massive Hemorrhage',
      category: 'RED_RESUSCITATION',
      urgencyLabel: 'Level 1: Immediate Surgical Intervention',
      actionRequired: 'Locate Level-1 / Level-2 Trauma Center with active Blood Bank and Trauma Operating Theater.',
      goldenHourWindowMinutes: 60,
      criticalIndicators: [
        'Pulsating arterial bright red blood',
        'Blunt abdominal trauma with distension',
        'Suspected cervical spine or spinal fracture',
        'Severe head injury with loss of consciousness or pupil asymmetry'
      ],
      firstAidAdvice: [
        'Apply direct firm pressure on bleeding wounds using clean cloth/gauze',
        'Immobilize the head and neck; do not twist spine during transport',
        'Elevate bleeding extremities if fractures are not suspected',
        'Prevent hypothermia by covering patient with a dry blanket'
      ]
    },
    {
      id: 'severe-respiratory-distress',
      name: 'Severe Breathing Difficulty / Asthma / Low SpO2',
      category: 'ORANGE_EMERGENT',
      urgencyLabel: 'Level 2: Emergent Respiratory Support',
      actionRequired: 'Locate Hospital with High-Flow Oxygen and Ventilator availability immediately.',
      goldenHourWindowMinutes: 30,
      criticalIndicators: [
        'SpO2 reading below 90% on pulse oximeter',
        'Cyanosis (bluish tint around lips, fingernails)',
        'Inability to speak full sentences in one breath',
        'Audible stridor or severe wheezing with chest wall indrawing'
      ],
      firstAidAdvice: [
        'Sit patient upright leaning slightly forward (tripod position)',
        'Ensure good ventilation and fresh airflow',
        'Assist with prescribed rescue bronchodilator inhaler (with spacer if available)',
        'Do not crowd the patient; maintain calm reassurance'
      ]
    },
    {
      id: 'pediatric-seizure',
      name: 'Pediatric Febrile Seizure / High Infant Fever',
      category: 'ORANGE_EMERGENT',
      urgencyLabel: 'Level 2: Urgent Pediatric Emergency',
      actionRequired: 'Locate hospital with Pediatric Intensive Care (PICU) and Neonatal care unit.',
      criticalIndicators: [
        'Body temperature > 103°F (39.4°C) with rhythmic jerking',
        'Stiffening of limbs with eyes rolled upward',
        'Unresponsiveness lasting more than 3 minutes',
        'Lethargy or inability to feed in infants under 3 months'
      ],
      firstAidAdvice: [
        'Place child gently on their side on a soft surface to prevent choking',
        'Do NOT put fingers, spoons, or objects inside child\'s mouth',
        'Clear nearby sharp objects',
        'Apply room-temperature damp sponge on forehead and neck after seizure ceases'
      ]
    },
    {
      id: 'moderate-fracture',
      name: 'Isolated Limb Fracture / Moderate Sprain / Laceration',
      category: 'YELLOW_URGENT',
      urgencyLabel: 'Level 3: Urgent Orthopedic / Surgical Triage',
      actionRequired: 'Locate hospital with Orthopedic OPD or urgent care center with X-ray availability.',
      criticalIndicators: [
        'Visible deformity or localized intense tenderness',
        'Inability to bear weight without neurovascular compromise',
        'Moderate bleeding controlled by direct compression'
      ],
      firstAidAdvice: [
        'Splint the limb in position found using rigid material (rolled cardboard/umbrella)',
        'Apply cold ice packs wrapped in cloth (never apply raw ice directly to skin)',
        'Keep limb elevated above heart level if comfortable'
      ]
    },
    {
      id: 'routine-opd',
      name: 'Mild Seasonal Fever / Routine Health Consultation',
      category: 'GREEN_LESS_URGENT',
      urgencyLabel: 'Level 4/5: Non-Emergency Outpatient (OPD)',
      actionRequired: 'Plan your OPD visit during Low-Crowd prediction windows (e.g. 11:30 AM - 1:00 PM or early morning) to avoid long queues.',
      criticalIndicators: [
        'Mild low-grade fever (< 100°F) without red flag symptoms',
        'Routine follow-up or prescription renewal',
        'Chronic stable pain or minor skin rashes'
      ],
      firstAidAdvice: [
        'Stay well hydrated with ORS, coconut water, or clean fluids',
        'Monitor temperature every 4-6 hours',
        'Use QueueLess Bharat Waiting-Time Predictor to pick the shortest wait hospital'
      ]
    }
  ];

  public static getProtocolById(id: string): SymptomGuide | undefined {
    return this.SYMPTOM_PROTOCOLS.find(p => p.id === id);
  }
}
