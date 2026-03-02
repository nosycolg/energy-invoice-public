export interface EnergyGrouped {
  year: number;
  month: number;
  consumoEnergiaKwh: number;
  energiaCompensadaKwh: number;
}

export interface EnergyTotals {
  consumoEnergiaKwh: number;
  energiaCompensadaKwh: number;
}

export interface EnergyDashboard {
  grouped: EnergyGrouped[];
  totals: EnergyTotals;
}


export interface FinancialGrouped {
  year: number;
  month: number;
  valorTotalSemGd: number;
  economiaGdReais: number;
}

export interface FinancialTotals {
  valorTotalSemGd: number;
  economiaGdReais: number;
}

export interface FinancialDashboard {
  grouped: FinancialGrouped[];
  totals: FinancialTotals;
}

export interface Invoice {
  id: number;
  clientNumber: string;
  referenceMonth: string;
  energiaEletricaKwh: number;
  energiaEletricaReais: number;
  energiaSceeeKwh: number;
  energiaSceeeReais: number;
  energiaCompensadaKwh: number;
  energiaCompensadaReais: number;
  contribIlumPublica: number;
  consumoEnergiaKwh: number;
  economiaGdReais: number;
  valorTotalSemGd: number;
  fileName: string;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  meta?: PaginationMeta;
}
