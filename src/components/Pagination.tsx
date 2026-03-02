import Link from 'next/link';
import type { PaginationMeta } from '@/lib/types';

interface PaginationProps {
  meta: PaginationMeta;
  currentPage: number;
  filterParams?: Record<string, string>;
}

export function Pagination({ meta, currentPage, filterParams = {} }: PaginationProps) {
  if (meta.totalPages <= 1) return null;

  const pages = Array.from({ length: meta.totalPages }, (_, i) => i + 1);

  const buildHref = (p: number) => {
    const params = new URLSearchParams({ ...filterParams, page: String(p) });
    return `/?${params}`;
  };

  const getVisiblePages = () => {
    if (meta.totalPages <= 7) return pages;
    if (currentPage <= 4) return [...pages.slice(0, 5), -1, meta.totalPages];
    if (currentPage >= meta.totalPages - 3)
      return [1, -1, ...pages.slice(meta.totalPages - 5)];
    return [1, -1, currentPage - 1, currentPage, currentPage + 1, -2, meta.totalPages];
  };

  const visible = getVisiblePages();

  return (
    <div className="flex items-center justify-between pt-4">
      <span className="text-xs text-slate-400">
        {meta.total} fatura{meta.total !== 1 ? 's' : ''} no total
      </span>

      <div className="flex items-center gap-1">
        {currentPage > 1 ? (
          <Link
            href={buildHref(currentPage - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Página anterior"
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-200 cursor-not-allowed">
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}

        {visible.map((p, i) =>
          p < 0 ? (
            <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-slate-300 text-xs">
              ···
            </span>
          ) : (
            <Link
              key={p}
              href={buildHref(p)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition ${
                p === currentPage
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {p}
            </Link>
          )
        )}

        {currentPage < meta.totalPages ? (
          <Link
            href={buildHref(currentPage + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Próxima página"
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-200 cursor-not-allowed">
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>
    </div>
  );
}
