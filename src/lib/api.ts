import type {
  ApiResponse,
  EnergyDashboard,
  FinancialDashboard,
  Invoice,
  PaginationMeta,
} from './types';

const API_BASE = process.env.API_URL || 'http://localhost:3002';

const API_KEY = process.env.API_KEY || '';

const NO_CACHE: RequestInit = {
  cache: 'no-store',
  headers: { 'x-api-key': API_KEY },
};

export interface DashboardFilters {
  start?: string;
  end?: string;
  client?: string;
}

export interface InvoiceFilters {
  month?: string;
  client?: string;
  start?: string;
  end?: string;
}

export async function fetchEnergyDashboard(
  filters: DashboardFilters = {},
): Promise<EnergyDashboard> {
  const params = new URLSearchParams();
  if (filters.start)  params.set('start', filters.start);
  if (filters.end)    params.set('end', filters.end);
  if (filters.client) params.set('client', filters.client);

  const qs = params.toString();
  const res = await fetch(`${API_BASE}/dashboard/energy${qs ? `?${qs}` : ''}`, NO_CACHE);
  if (!res.ok) throw new Error(`energy dashboard: ${res.status}`);
  const json: ApiResponse<EnergyDashboard> = await res.json();
  return json.data;
}

export async function fetchFinancialDashboard(
  filters: DashboardFilters = {},
): Promise<FinancialDashboard> {
  const params = new URLSearchParams();
  if (filters.start)  params.set('start', filters.start);
  if (filters.end)    params.set('end', filters.end);
  if (filters.client) params.set('client', filters.client);

  const qs = params.toString();
  const res = await fetch(`${API_BASE}/dashboard/financial${qs ? `?${qs}` : ''}`, NO_CACHE);
  if (!res.ok) throw new Error(`financial dashboard: ${res.status}`);
  const json: ApiResponse<FinancialDashboard> = await res.json();
  return json.data;
}

export async function fetchInvoices(
  page = 1,
  limit = 12,
  filters: InvoiceFilters = {},
): Promise<{ invoices: Invoice[]; meta: PaginationMeta }> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (filters.client) params.set('client', filters.client);
  if (filters.month)  params.set('month', filters.month);
  if (filters.start)  params.set('start', filters.start);
  if (filters.end)    params.set('end', filters.end);

  const res = await fetch(`${API_BASE}/invoices?${params}`, NO_CACHE);
  if (!res.ok) throw new Error(`invoices: ${res.status}`);
  const json: ApiResponse<Invoice[]> = await res.json();

  return {
    invoices: json.data,
    meta: json.meta ?? { page, limit, total: 0, totalPages: 0 },
  };
}
