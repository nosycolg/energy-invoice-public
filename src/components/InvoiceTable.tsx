import type { Invoice } from '@/lib/types';

const BRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const KWH = (v: number) =>
  `${v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kWh`;

interface InvoiceTableProps {
  invoices: Invoice[];
}

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <svg
          className="mb-3 h-10 w-10 opacity-30"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-sm font-medium">Nenhuma fatura encontrada</p>
        <p className="mt-1 text-xs">Faça o upload de um PDF para começar</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            {[
              'Cliente',
              'Mês Ref.',
              'Consumo',
              'Comp. GD',
              'Valor s/GD',
              'Economia GD',
              'Contrib. IP',
            ].map((h) => (
              <th
                key={h}
                className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400 first:pl-0 last:pr-0"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {invoices.map((inv) => (
            <tr
              key={inv.id}
              className="group transition-colors hover:bg-slate-50/60"
            >
              <td className="whitespace-nowrap px-4 py-3.5 pl-0 font-mono text-xs font-medium text-slate-700">
                {inv.clientNumber}
              </td>
              <td className="whitespace-nowrap px-4 py-3.5 font-medium text-slate-800">
                {inv.referenceMonth}
              </td>
              <td className="whitespace-nowrap px-4 py-3.5 tabular-nums text-slate-700">
                {KWH(inv.consumoEnergiaKwh)}
              </td>
              <td className="whitespace-nowrap px-4 py-3.5 tabular-nums text-emerald-600">
                {KWH(inv.energiaCompensadaKwh)}
              </td>
              <td className="whitespace-nowrap px-4 py-3.5 tabular-nums text-slate-700">
                {BRL(inv.valorTotalSemGd)}
              </td>
              <td className="whitespace-nowrap px-4 py-3.5 tabular-nums font-medium text-emerald-600">
                {BRL(inv.economiaGdReais)}
              </td>
              <td className="whitespace-nowrap px-4 py-3.5 pr-0 tabular-nums text-slate-500">
                {BRL(inv.contribIlumPublica)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
