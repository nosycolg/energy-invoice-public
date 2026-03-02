import { Suspense } from 'react';
import { Zap, Leaf, DollarSign, TrendingDown } from 'lucide-react';
import { fetchEnergyDashboard, fetchFinancialDashboard, fetchInvoices } from '@/lib/api';
import { StatCard } from '@/components/StatCard';
import { EnergyChart } from '@/components/EnergyChart';
import { FinancialChart } from '@/components/FinancialChart';
import { InvoiceTable } from '@/components/InvoiceTable';
import { Pagination } from '@/components/Pagination';
import { FilterBar, type ActiveFilters } from '@/components/FilterBar';

const MONTH_CODES = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
function toApiPeriod(v?: string): string | undefined {
  if (!v) return undefined;
  if (v.includes('/')) return v;
  const [year, month] = v.split('-');
  const code = MONTH_CODES[parseInt(month, 10) - 1];
  if (!code || !year) return undefined;
  return `${code}/${year}`;
}

const KWH = (v: number) =>
  v.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' kWh';

const BRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

interface HomeProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function sp(v: string | string[] | undefined): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

export default async function Home({ searchParams }: HomeProps) {
  const p = await searchParams;

  const page   = Math.max(1, parseInt(sp(p.page) ?? '1', 10) || 1);
  const client = sp(p.client);
  const start  = sp(p.start);
  const end    = sp(p.end);
  const month  = sp(p.month);

  const apiStart = toApiPeriod(start);
  const apiEnd   = toApiPeriod(end);

  const dashFilters    = { client, start: apiStart, end: apiEnd };
  const invoiceFilters = { client, month, start: apiStart, end: apiEnd };

  const activeFilters: ActiveFilters = { client, start, end };

  const filterParams: Record<string, string> = {};
  if (client) filterParams.client = client;
  if (start)  filterParams.start  = start;
  if (end)    filterParams.end    = end;
  if (month)  filterParams.month  = month;

  const [energy, financial, { invoices, meta }] = await Promise.all([
    fetchEnergyDashboard(dashFilters).catch((e) => { console.error('[energy]', e); return null; }),
    fetchFinancialDashboard(dashFilters).catch((e) => { console.error('[financial]', e); return null; }),
    fetchInvoices(page, 12, invoiceFilters).catch((e) => {
      console.error('[invoices]', e);
      return { invoices: [] as never[], meta: { page: 1, limit: 12, total: 0, totalPages: 0 } };
    }),
  ]);

  const energyTotals    = energy?.totals    ?? { consumoEnergiaKwh: 0, energiaCompensadaKwh: 0 };
  const financialTotals = financial?.totals ?? { valorTotalSemGd: 0, economiaGdReais: 0 };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      <Suspense fallback={<FilterBarSkeleton />}>
        <FilterBar active={activeFilters} />
      </Suspense>

      <section className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Consumo Total"
          value={KWH(energyTotals.consumoEnergiaKwh)}
          sub="energia elétrica"
          icon={Zap}
          accent="emerald"
        />
        <StatCard
          label="Energia Compensada"
          value={KWH(energyTotals.energiaCompensadaKwh)}
          sub="geração distribuída"
          icon={Leaf}
          accent="amber"
        />
        <StatCard
          label="Valor Total s/GD"
          value={BRL(financialTotals.valorTotalSemGd)}
          sub="sem desconto GD"
          icon={DollarSign}
          accent="blue"
        />
        <StatCard
          label="Economia GD"
          value={BRL(financialTotals.economiaGdReais)}
          sub="créditos geração"
          icon={TrendingDown}
          accent="violet"
        />
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Energia Elétrica</h2>
            <p className="text-xs text-slate-400">
              Consumo vs. Compensada GD (kWh)
              {apiStart && apiEnd && <span className="ml-1 font-medium text-slate-500">· {apiStart} → {apiEnd}</span>}
              {client && <span className="ml-1 font-medium text-slate-500">· Cliente {client}</span>}
            </p>
          </div>
          {energy?.grouped.length ? (
            <EnergyChart data={energy.grouped} />
          ) : (
            <EmptyChart />
          )}
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Financeiro</h2>
            <p className="text-xs text-slate-400">
              Valor faturado vs. Economia GD (R$)
              {apiStart && apiEnd && <span className="ml-1 font-medium text-slate-500">· {apiStart} → {apiEnd}</span>}
              {client && <span className="ml-1 font-medium text-slate-500">· Cliente {client}</span>}
            </p>
          </div>
          {financial?.grouped.length ? (
            <FinancialChart data={financial.grouped} />
          ) : (
            <EmptyChart />
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-50 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Faturas</h2>
            <p className="text-xs text-slate-400">
              {meta.total > 0
                ? `${meta.total} registro${meta.total !== 1 ? 's' : ''}`
                : 'Nenhum registro'}
              {month  && <span className="ml-1 font-medium text-slate-500">· {month}</span>}
              {client && <span className="ml-1 font-medium text-slate-500">· Cliente {client}</span>}
            </p>
          </div>
        </div>

        <div className="px-5 pb-2">
          <InvoiceTable invoices={invoices} />
          <Pagination meta={meta} currentPage={page} filterParams={filterParams} />
        </div>
      </section>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-60 items-center justify-center text-slate-300">
      <div className="text-center">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-50">
          <Zap className="h-5 w-5 text-slate-300" strokeWidth={1.5} />
        </div>
        <p className="text-xs">Sem dados para exibir</p>
      </div>
    </div>
  );
}

function FilterBarSkeleton() {
  return (
    <div className="mb-6 h-[180px] animate-pulse rounded-2xl border border-slate-100 bg-white shadow-sm" />
  );
}
