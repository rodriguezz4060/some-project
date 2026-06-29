export const MOCK_VEHICLES = [
  {
    brand: "Ford",
    model: "Transit",
    licensePlate: "АА1234ВВ",
    type: "truck",
    year: 2021,
    vin: "WF0AXXBDFGHA12345",
    fuelType: "diesel",
    tankCapacity: 80,
    unit: "1-ша механізована рота",
    notes: null,
  },
  {
    brand: "HMMWV",
    model: "M1151",
    licensePlate: "АА5678СС",
    type: "armored",
    year: 2019,
    vin: "1G8ED30J1VF123456",
    fuelType: "diesel",
    tankCapacity: 95,
    unit: "1-ша механізована рота",
    notes: "Броньований позашляховик",
  },
  {
    brand: "КрАЗ",
    model: "6322",
    licensePlate: "АА9012DD",
    type: "truck",
    year: 2020,
    vin: "Y8K632200M1234567",
    fuelType: "diesel",
    tankCapacity: 250,
    unit: "2-га механізована рота",
    notes: "Паливозаправник",
  },
  {
    brand: "УАЗ",
    model: "469",
    licensePlate: "ВН3456ЕЕ",
    type: "car",
    year: 2018,
    vin: "XTT469000M1234567",
    fuelType: "gasoline-a95",
    tankCapacity: 56,
    unit: "1-ша механізована рота",
    notes: null,
  },
  {
    brand: "Renault",
    model: "Premium 460",
    licensePlate: "ВН7890FF",
    type: "truck",
    year: 2022,
    vin: "VF611GPA000123456",
    fuelType: "diesel",
    tankCapacity: 400,
    unit: "Рота матеріального забезпечення",
    notes: "Сідловий тягач",
  },
  {
    brand: "Богдан",
    model: "6317",
    licensePlate: "ВК1234GG",
    type: "bus",
    year: 2021,
    vin: "Y6D631700M1234567",
    fuelType: "diesel",
    tankCapacity: 120,
    unit: "2-га механізована рота",
    notes: null,
  },
];

const drivers = [
  "Сергій Коваленко",
  "Андрій Мельник",
  "Олег Бондаренко",
  "Іван Гриценко",
  "Михайло Лисенко",
  "Віталій Шевченко",
  "Дмитро Кравець",
  "Роман Ткаченко",
];

const purposes = ["combat", "rotation", "logistics", "training", "other"];

function randomDate(start: Date, end: Date): string {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString().split("T")[0];
}

function randomFloat(min: number, max: number, decimals = 2): number {
  return Math.round((Math.random() * (max - min) + min) * 10 ** decimals) / 10 ** decimals;
}

export function generateMockFuelRecords(vehicleCount: number): {
  vehicleId: number;
  date: string;
  fuelType: string;
  liters: number;
  pricePerLiter: number | null;
  totalCost: number | null;
  mileage: number | null;
  driverName: string;
  invoiceNumber: string | null;
  supplier: string | null;
  purpose: string | null;
}[] {
  const records: ReturnType<typeof generateMockFuelRecords> = [];
  const now = new Date();
  const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

  const fuelPrices: Record<string, number> = {
    diesel: 53.5,
    "gasoline-a95": 55.2,
    "gasoline-a98": 58.0,
    gas: 32.0,
    electric: 7.5,
  };

  for (let vehicleId = 1; vehicleId <= vehicleCount; vehicleId++) {
    const recordCount = Math.floor(Math.random() * 12) + 3;
    let lastMileage = 5000 + vehicleId * 10000;

    for (let i = 0; i < recordCount; i++) {
      const date = randomDate(yearAgo, now);
      const liters = randomFloat(20, 70, 1);
      const fuelType = vehicleId % 3 === 0 ? "gasoline-a95" : "diesel";
      const ppl = fuelPrices[fuelType] ?? 50;
      const pplVaried = randomFloat(ppl - 3, ppl + 3);
      lastMileage += Math.floor(Math.random() * 300) + 50;

      records.push({
        vehicleId,
        date,
        fuelType,
        liters,
        pricePerLiter: Math.round(pplVaried * 100) / 100,
        totalCost: Math.round(liters * pplVaried * 100) / 100,
        mileage: lastMileage,
        driverName: drivers[Math.floor(Math.random() * drivers.length)],
        invoiceNumber: i % 3 === 0 ? `НК-${String(vehicleId)}-${String(i + 1).padStart(3, "0")}` : null,
        supplier: i % 2 === 0 ? "ТОВ «Пальне-Сервіс»" : "ДП «Укрпаливо»",
        purpose: purposes[Math.floor(Math.random() * purposes.length)],
      });
    }
  }

  records.sort((a, b) => b.date.localeCompare(a.date));
  return records;
}
