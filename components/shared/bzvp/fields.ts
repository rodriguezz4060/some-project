export const FIELD_LABELS: Record<string, string> = {
  fullName: "ПІБ",
  rank: "Звання",
  birthDate: "Дата народження",
  birthPlace: "Місце народження",
  photo: "Фото",
  passport: "Паспорт",
  passportIssued: "Паспорт видано",
  tin: "ІПН",
  militaryId: "Військовий квиток",
  militaryIdIssued: "В/к видано",
  ubd: "УБД",
  ubdDate: "Дата УБД",
  serviceUnit: "В/ч",
  serviceYears: "Роки служби",
  civilianJob: "Цивільна робота",
  education: "Освіта",
  actualAddress: "Фактична адреса",
  registrationAddress: "Прописка",
  driverLicense: "Посвідчення водія",
  criminalRecord: "Судимість",
  policeRecords: "Поліція",
  family: "Склад сім'ї",
  phone: "Телефон",
  relativePhones: "Телефони рідних",
  personalOrder: "Особисте розпорядження",
  conscription: "Призваний",
  health: "Стан здоров'я",
  healthComplaints: "Скарги",
  moralState: "Моральний стан",
  bloodType: "Група крові",
  shoeSize: "Розмір взуття",
  notes: "Примітки",
  status: "Статус",
  arrivalDate: "Дата прибуття",
  trainingPeriod: "Період навчання",
  specialization: "Спеціалізація",
  createdAt: "Дата створення",
};

export const SECTIONS: { title: string; fields: string[] }[] = [
  {
    title: "Основні дані",
    fields: ["fullName", "rank", "birthDate", "birthPlace", "status", "arrivalDate", "trainingPeriod", "specialization"],
  },
  {
    title: "Документи",
    fields: ["passport", "passportIssued", "tin", "militaryId", "militaryIdIssued", "ubd", "ubdDate"],
  },
  {
    title: "Військова служба",
    fields: ["serviceUnit", "serviceYears", "conscription"],
  },
  {
    title: "Контакти та адреса",
    fields: ["phone", "relativePhones", "actualAddress", "registrationAddress"],
  },
  {
    title: "Освіта та робота",
    fields: ["education", "civilianJob", "driverLicense"],
  },
  {
    title: "Здоров'я",
    fields: ["health", "healthComplaints", "moralState", "bloodType", "shoeSize"],
  },
  {
    title: "Інше",
    fields: ["family", "criminalRecord", "policeRecords", "personalOrder", "notes", "photo"],
  },
];

export const ALL_FIELDS = SECTIONS.flatMap((s) => s.fields);
