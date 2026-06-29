export type FuelType = "gasoline-a95" | "gasoline-a98" | "diesel" | "gas" | "electric";

export type VehicleType = "car" | "truck" | "special" | "armored" | "bus";

export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  licensePlate: string;
  type: VehicleType;
  year: number | null;
  vin: string | null;
  fuelType: FuelType;
  tankCapacity: number | null;
  unit: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  fuelRecords?: FuelRecord[];
  _fuelSummary?: {
    totalLiters: number;
    totalCost: number;
    recordCount: number;
    lastRecordDate: string | null;
  };
}

export interface FuelRecord {
  id: number;
  vehicleId: number;
  vehicle?: Vehicle;
  date: string;
  fuelType: FuelType;
  liters: number;
  pricePerLiter: number | null;
  totalCost: number | null;
  mileage: number | null;
  driverName: string;
  invoiceNumber: string | null;
  supplier: string | null;
  purpose: string | null;
  createdById: number;
  createdBy?: { id: number; name: string | null };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVehicleData {
  brand: string;
  model: string;
  licensePlate: string;
  type: string;
  year?: number;
  vin?: string;
  fuelType: string;
  tankCapacity?: number;
  unit: string;
  notes?: string;
}

export interface CreateFuelRecordData {
  vehicleId: number;
  date: string;
  fuelType: string;
  liters: number;
  pricePerLiter?: number;
  totalCost?: number;
  mileage?: number;
  driverName: string;
  invoiceNumber?: string;
  supplier?: string;
  purpose?: string;
}
