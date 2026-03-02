"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X, Search } from "lucide-react";
import { MonthRangePicker } from "@/components/MonthRangePicker";
import { UploadButton } from "@/components/UploadButton";

export interface ActiveFilters {
  client?: string;
  start?: string;
  end?: string;
}

export function FilterBar({ active }: { active: ActiveFilters }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [client, setClient] = useState(active.client ?? "");
  const [start, setStart] = useState(active.start ?? "");
  const [end, setEnd] = useState(active.end ?? "");

  const [isEditingClient, setIsEditingClient] = useState(!active.client);
  const inputRef = useRef<HTMLInputElement>(null);

  const intervalError = (start && !end) || (!start && end);

  useEffect(() => {
    setClient(active.client ?? "");
    setStart(active.start ?? "");
    setEnd(active.end ?? "");
    setIsEditingClient(!active.client);
  }, [active.client, active.start, active.end]);

  const apply = () => {
    if (intervalError) return;

    const params = new URLSearchParams(sp.toString());

    if (client.trim()) params.set("client", client.trim());
    else params.delete("client");

    if (start && end) {
      params.set("start", start);
      params.set("end", end);
    } else {
      params.delete("start");
      params.delete("end");
    }

    const q = params.toString();
    router.push(`${pathname}${q ? `?${q}` : ""}`);

    if (client.trim()) {
      setIsEditingClient(false);
    }
  };

  const clear = () => {
    setClient("");
    setStart("");
    setEnd("");
    setIsEditingClient(true);
    router.push(pathname);
  };

  const hasFilters = !!(active.client || active.start || active.end);

  return (
    <div className="mb-8 w-full">
      <div className="flex flex-col xl:flex-row items-center gap-3 w-full bg-white rounded-3xl shadow-sm border border-slate-100 p-2 md:p-3">
        <div className="flex-1 w-full flex flex-col sm:flex-row items-center gap-2 relative">
          <div
            className="flex-1 w-full flex items-center h-12 md:h-14 bg-slate-50 hover:bg-slate-100 rounded-2xl px-4 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 border border-transparent transition-all overflow-hidden relative cursor-text"
            onClick={() => {
              if (!isEditingClient) {
                setIsEditingClient(true);
                setTimeout(() => inputRef.current?.focus(), 0);
              } else {
                inputRef.current?.focus();
              }
            }}
          >
            <Search className="h-5 w-5 text-slate-400 mr-3 shrink-0" />

            {active.client && !isEditingClient ? (
              <div className="flex-1 flex items-center justify-between w-full">
                <span className="text-sm md:text-base font-bold text-slate-800 truncate">
                  Nº {active.client}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setClient("");
                    setIsEditingClient(true);

                    const params = new URLSearchParams(sp.toString());
                    params.delete("client");
                    router.push(`${pathname}?${params.toString()}`);
                  }}
                  className="p-1.5 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <input
                ref={inputRef}
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value.replace(/\D/g, ""))}
                onBlur={() => {
                  if (active.client && client !== active.client) {
                    setClient(active.client);
                    setIsEditingClient(false);
                  } else if (active.client && client === active.client) {
                    setIsEditingClient(false);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    apply();
                  }
                }}
                placeholder="Buscar Nº do Cliente"
                className="w-full min-w-0 bg-transparent outline-none text-sm md:text-base font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal h-full"
              />
            )}
          </div>

          <div className="hidden md:block w-px h-8 bg-slate-200 mx-1"></div>

          <div className="w-full md:w-auto relative mt-2 md:mt-0">
            <MonthRangePicker
              start={start}
              end={end}
              onChange={(s, e) => {
                setStart(s);
                setEnd(e);
              }}
              onClear={() => {
                setStart("");
                setEnd("");

                const params = new URLSearchParams(sp.toString());
                params.delete("start");
                params.delete("end");
                router.push(`${pathname}?${params.toString()}`);
              }}
            />
            {intervalError && (
              <p className="absolute -bottom-6 left-2 text-[10px] font-bold text-red-500 whitespace-nowrap bg-white px-2 py-0.5 rounded-full shadow-sm border border-red-100 z-10">
                ⚠️ Selecione o fim do período
              </p>
            )}
          </div>

          <div className="flex w-full md:w-auto items-center gap-2 shrink-0 md:ml-1 mt-2 md:mt-0">
            <div className="flex w-full sm:w-auto gap-2 flex-col sm:flex-row">
              {hasFilters && (
                <button
                  onClick={clear}
                  className="w-full sm:w-auto h-12 md:h-14 px-5 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors flex items-center justify-center border border-slate-200 md:border-transparent md:hover:border-slate-200"
                >
                  Limpar
                </button>
              )}
              <button
                onClick={apply}
                disabled={!!intervalError}
                className={`w-full sm:w-auto h-12 md:h-14 px-8 rounded-2xl text-sm md:text-base font-bold text-white shadow-md transition-all 
                  ${
                    intervalError
                      ? "cursor-not-allowed bg-slate-300 shadow-none"
                      : "bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-emerald-700/30 active:scale-95"
                  }`}
              >
                Buscar
              </button>
            </div>
          </div>
        </div>

        <div className="hidden xl:block w-px h-10 bg-slate-200 mx-2"></div>

        <div className="w-full xl:w-auto shrink-0 border-t border-slate-100 xl:border-none pt-3 xl:pt-0 pb-1 xl:pb-0 px-1 xl:px-0">
          <UploadButton />
        </div>
      </div>
    </div>
  );
}
