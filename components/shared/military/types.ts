export type StatusType = "active" | "on-mission" | "wounded" | "vacation" | "reserve";

export type RankType =
  | "старший лейтенант"
  | "капітан"
  | "сержант"
  | "майор"
  | "полковник"
  | "лейтенант";

export interface MedicalRecord {
  condition: string;
  diagnosisDate: string;
  status: "active" | "resolved";
  notes?: string;
}

export interface Achievement {
  name: string;
  date: string;
  type: "medal" | "commendation" | "certificate";
  description?: string;
}

export interface Equipment {
  name: string;
  type: "weapon" | "armor" | "gear";
  serialNumber?: string;
  issuedDate: string;
}

export interface ClothingSizes {
  height?: string;
  chest?: string;
  waist?: string;
  shoes?: string;
  headgear?: string;
  uniform?: string;
}

export interface PositionEntry {
  position: string;
  unit: string;
  startDate: string;
  endDate?: string;
}

export interface MilitaryPersonnel {
  id: number;
  fullName: string;
  rank: RankType;
  position: string;
  unit: string;
  status: StatusType;
  birthDate: string;
  photo?: string;
  experience?: number;
  missions?: number;
  phone?: string;
  email?: string;
  lastActiveDays?: number;
  medicalRecords?: MedicalRecord[];
  achievements?: Achievement[];
  equipment?: Equipment[];
  clothingSizes?: ClothingSizes;
  positionHistory?: PositionEntry[];
}
