export type StatusType = "active" | "on-mission" | "wounded" | "vacation" | "reserve";

export type RankType =
  | "старший лейтенант"
  | "капітан"
  | "сержант"
  | "майор"
  | "полковник"
  | "лейтенант";

export interface MilitaryPersonnel {
  id: string;
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
  lastActive?: string;
}
