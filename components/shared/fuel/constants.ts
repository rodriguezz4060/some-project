import type { FuelType, VehicleType } from "./types";

export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  "gasoline-a95": "А-95",
  "gasoline-a98": "А-98",
  diesel: "ДП",
  gas: "Газ",
  electric: "Електро",
};

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  car: "Легковий",
  truck: "Вантажний",
  special: "Спецтехніка",
  armored: "Броньований",
  bus: "Автобус",
};

export const PURPOSE_LABELS: Record<string, string> = {
  combat: "Бойове завдання",
  rotation: "Планова заміна",
  logistics: "Господарчі потреби",
  training: "Навчання",
  other: "Інше",
};

export const VEHICLE_TYPE_OPTIONS = Object.entries(VEHICLE_TYPE_LABELS).map(
  ([value, label]) => ({ value, label }),
);

export const FUEL_TYPE_OPTIONS = Object.entries(FUEL_TYPE_LABELS).map(
  ([value, label]) => ({ value, label }),
);
