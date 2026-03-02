"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  X,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type FileStatus = "idle" | "uploading" | "done" | "error" | "duplicate";

interface FileEntry {
  file: File;
  status: FileStatus;
  message?: string;
}

interface FileResult {
  fileName: string;
  status: "success" | "duplicate" | "error";
  error?: string;
}

interface UploadResponse {
  data: {
    results: FileResult[];
    summary: {
      total: number;
      success: number;
      duplicates: number;
      errors: number;
    };
  };
  error?: string;
}

const KB = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

function validateFile(f: File): string | null {
  if (f.type !== "application/pdf") return "Apenas PDFs são aceitos.";
  if (f.size > 5 * 1024 * 1024) return "Tamanho máximo: 5 MB.";
  return null;
}

function StatusBadge({
  status,
  message,
}: {
  status: FileStatus;
  message?: string;
}) {
  if (status === "idle")
    return (
      <span className="text-xs text-slate-400">{message ?? "Pronto"}</span>
    );
  if (status === "uploading")
    return (
      <span className="flex items-center gap-1 text-xs text-blue-500">
        <Loader2 className="h-3 w-3 animate-spin" />
        Processando…
      </span>
    );
  if (status === "done")
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
        <CheckCircle2 className="h-3 w-3" />
        Importado
      </span>
    );
  if (status === "duplicate")
    return (
      <span className="flex items-center gap-1 text-xs text-amber-500">
        <AlertCircle className="h-3 w-3" />
        Duplicado
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-xs text-red-500">
      <AlertCircle className="h-3 w-3" />
      {message ?? "Erro"}
    </span>
  );
}

export function UploadButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const incoming: FileEntry[] = Array.from(fileList).map((f) => {
      const err = validateFile(f);
      return {
        file: f,
        status: err ? "error" : "idle",
        message: err ?? undefined,
      };
    });
    setEntries((prev) => {
      const existing = new Set(prev.map((e) => e.file.name));
      const merged = [...prev];
      for (const entry of incoming) {
        if (!existing.has(entry.file.name)) {
          merged.push(entry);
          existing.add(entry.file.name);
        }
      }
      return merged;
    });
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeEntry = (index: number) =>
    setEntries((prev) => prev.filter((_, i) => i !== index));

  const uploadAll = async () => {
    const validIndices: number[] = [];
    const validFiles: File[] = [];

    entries.forEach((e, i) => {
      if (e.status === "idle") {
        validIndices.push(i);
        validFiles.push(e.file);
      }
    });

    if (!validFiles.length) return;
    setRunning(true);

    setEntries((prev) =>
      prev.map((e, i) =>
        validIndices.includes(i) ? { ...e, status: "uploading" as const } : e,
      ),
    );

    try {
      const formData = new FormData();
      validFiles.forEach((f) => formData.append("files", f));

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const json = (await res.json().catch(() => ({}))) as UploadResponse;

      if (!res.ok && !json?.data?.results) {
        setEntries((prev) =>
          prev.map((e) =>
            e.status === "uploading"
              ? {
                  ...e,
                  status: "error",
                  message: json?.error ?? `HTTP ${res.status}`,
                }
              : e,
          ),
        );
      } else {
        const resultMap = new Map<string, FileResult>();
        for (const r of json.data.results) {
          resultMap.set(r.fileName, r);
        }

        setEntries((prev) =>
          prev.map((e) => {
            if (e.status !== "uploading") return e;
            const r = resultMap.get(e.file.name);
            if (!r)
              return {
                ...e,
                status: "error",
                message: "Sem resultado do servidor.",
              };
            if (r.status === "success") return { ...e, status: "done" };
            if (r.status === "duplicate")
              return { ...e, status: "duplicate", message: "Já processada." };
            return { ...e, status: "error", message: r.error ?? "Erro." };
          }),
        );
      }
    } catch {
      setEntries((prev) =>
        prev.map((e) =>
          e.status === "uploading"
            ? { ...e, status: "error", message: "Erro de conexão." }
            : e,
        ),
      );
    }

    setRunning(false);
    setFinished(true);
    router.refresh();
  };

  const close = () => {
    if (running) return;
    setOpen(false);
    setTimeout(() => {
      setEntries([]);
      setFinished(false);
    }, 200);
  };

  const validCount = entries.filter((e) => e.status !== "error").length;
  const doneCount = entries.filter((e) => e.status === "done").length;
  const errorCount = entries.filter((e) => e.status === "error").length;
  const dupCount = entries.filter((e) => e.status === "duplicate").length;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-12 w-full md:h-14 items-center justify-center xl:w-auto gap-2 rounded-2xl bg-slate-900 px-6 text-sm md:text-base font-bold text-white shadow-md transition hover:bg-slate-800 active:scale-95"
      >
        <Upload className="h-5 w-5" strokeWidth={2} />
        Carregar faturas
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm sm:items-center"
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <div className="relative w-full max-w-lg rounded-t-2xl border border-slate-100 bg-white p-6 shadow-2xl sm:rounded-2xl">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                Upload de Faturas
              </h2>
              <button
                onClick={close}
                disabled={running}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 disabled:opacity-30"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Selecione até 20 PDFs — todos são enviados e processados em
              paralelo.
            </p>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                handleFiles(e.dataTransfer.files);
              }}
              onClick={() => inputRef.current?.click()}
              className={`mt-4 flex cursor-pointer select-none flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-6 transition ${
                dragging
                  ? "border-slate-400 bg-slate-50"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <Upload className="h-7 w-7 text-slate-300" strokeWidth={1.5} />
              <p className="text-sm text-slate-500">
                <span className="font-medium text-slate-700">
                  Clique ou arraste
                </span>{" "}
                PDFs aqui
              </p>
              <p className="text-xs text-slate-400">
                PDF · máx. 5 MB por arquivo
              </p>
            </div>

            {entries.length > 0 && (
              <div className="mt-4 max-h-52 space-y-1.5 overflow-y-auto pr-1">
                {running ? (
                  <div className="flex flex-col items-center justify-center space-y-3 py-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Enviando e processando...
                      </p>
                      <p className="text-xs text-slate-400">
                        Isso pode levar alguns segundos (IA analisando).
                      </p>
                    </div>
                  </div>
                ) : (
                  entries.map((entry, i) => (
                    <div
                      key={`${entry.file.name}-${i}`}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                        entry.status === "done"
                          ? "bg-emerald-50"
                          : entry.status === "error"
                            ? "bg-red-50"
                            : entry.status === "duplicate"
                              ? "bg-amber-50"
                              : "bg-slate-50"
                      }`}
                    >
                      <FileText
                        className={`h-5 w-5 shrink-0 ${
                          entry.status === "done"
                            ? "text-emerald-400"
                            : entry.status === "error"
                              ? "text-red-400"
                              : entry.status === "duplicate"
                                ? "text-amber-400"
                                : "text-slate-300"
                        }`}
                        strokeWidth={1.5}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-slate-700">
                          {entry.file.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {KB(entry.file.size)}
                        </p>
                      </div>
                      <StatusBadge
                        status={entry.status}
                        message={entry.message}
                      />
                      {!running && entry.status !== "uploading" && (
                        <button
                          onClick={() => removeEntry(i)}
                          className="ml-1 shrink-0 rounded p-0.5 text-slate-300 hover:text-slate-500"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
            {finished && (
              <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                {doneCount > 0 && (
                  <span className="font-medium text-emerald-600">
                    {doneCount} importada{doneCount !== 1 ? "s" : ""}{" "}
                  </span>
                )}
                {dupCount > 0 && (
                  <span className="font-medium text-amber-500">
                    · {dupCount} duplicada{dupCount !== 1 ? "s" : ""}{" "}
                  </span>
                )}
                {errorCount > 0 && (
                  <span className="font-medium text-red-500">
                    · {errorCount} com erro
                  </span>
                )}
              </p>
            )}

            <div className="mt-5 flex gap-2">
              <button
                onClick={close}
                disabled={running}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-30"
              >
                {finished ? "Fechar" : "Cancelar"}
              </button>
              {!finished && (
                <button
                  onClick={uploadAll}
                  disabled={running || validCount === 0}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {running ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processando…
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      {validCount > 1 ? `Enviar ${validCount} PDFs` : "Enviar"}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
