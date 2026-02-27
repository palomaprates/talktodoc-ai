import { useState, useCallback, useRef, useContext } from "react";
import { AuthContext } from "@/features/auth/AuthContext";
import { FaFile } from "react-icons/fa";
import { TbTrash } from "react-icons/tb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/lib/toast";
import type { UploadedTextFile } from "@/types";
import { uploadDocuments } from "../utils/uploadDocuments";
import { processFile } from "../utils/processFile";

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_FILES = 20;
const ALLOWED_TYPES = [".pdf", ".txt"];
const ALLOWED_MIMES = ["application/pdf", "text/plain"];

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

function validateFiles(fileList: FileList): { ok: File[]; errors: string[] } {
  const errors: string[] = [];
  const files = Array.from(fileList);
  const valid: File[] = [];

  if (files.length > MAX_FILES) {
    errors.push(`Máximo de ${MAX_FILES} arquivos por vez.`);
    return { ok: [], errors };
  }

  for (const file of files) {
    const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase();
    const allowed =
      ALLOWED_TYPES.includes(ext) || ALLOWED_MIMES.includes(file.type);
    if (!allowed) {
      errors.push(`"${file.name}": apenas PDF e TXT são permitidos.`);
      continue;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      errors.push(
        `"${file.name}": tamanho máximo ${MAX_FILE_SIZE_MB} MB.`,
      );
      continue;
    }
    valid.push(file);
  }
  return { ok: valid, errors };
}

export function Dropzone({
  onUploadSuccess,
}: {
  onUploadSuccess: () => Promise<void>;
}) {
  const { user } = useContext(AuthContext);
  const [files, setFiles] = useState<UploadedTextFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList) => {
    const { ok: validFiles, errors } = validateFiles(fileList);
    if (errors.length > 0) {
      errors.forEach((msg) => toast.error(msg));
      return;
    }
    if (validFiles.length === 0) return;

    const totalAfter = files.length + validFiles.length;
    if (totalAfter > MAX_FILES) {
      toast.error(`Máximo de ${MAX_FILES} arquivos. Remova alguns ou envie em lotes menores.`);
      return;
    }

    setIsLoading(true);
    try {
      const processedFiles = await Promise.all(validFiles.map(processFile));
      setFiles((prev) => [...prev, ...processedFiles]);
    } catch (error) {
      console.error("Error processing files:", error);
      toast.error(
        "Erro ao processar arquivos. Verifique os tipos (PDF ou TXT) e tente novamente.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files?.length) {
        await handleFiles(e.dataTransfer.files);
      }
    },
    [],
  );

  const handleFileClick = () => fileInputRef.current?.click();

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files?.length) {
      await handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!user) return;
    try {
      await uploadDocuments(files, user.id);
      await onUploadSuccess();
      setFiles([]);
      toast.success(
        "Arquivos enviados! Você já pode conversar com o documento.",
      );
    } catch (err) {
      console.error(err);
      toast.error("Falha ao enviar arquivos. Tente novamente.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-start px-4 py-6">
      <Card className="w-full min-h-[380px] flex flex-col items-center justify-start rounded-2xl border border-slate-100 bg-slate-50/80 p-6 sm:p-8 shadow-sm transition-all duration-500">
        <div className="w-full max-w-2xl mx-auto space-y-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleFileClick}
            className={`
              relative group cursor-pointer
              flex flex-col items-center justify-center text-center
              ${files.length > 0 ? "py-6 sm:py-8" : "py-10 sm:py-14"} px-4 sm:px-10
              rounded-2xl border border-dashed
              bg-white/80
              transition-all duration-300 ease-in-out
              ${isLoading ? "opacity-50 pointer-events-none" : ""}
              ${
                isDragging
                  ? "border-violet-500 bg-violet-50"
                  : "border-slate-200 hover:border-violet-400 hover:bg-violet-50/70"
              }
            `}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              className="hidden"
              multiple
              accept=".pdf,.txt"
            />
            <div className="p-4 rounded-full mb-4 bg-gradient-to-br from-violet-600 to-violet-500 text-white shadow-md group-hover:scale-110 transition-transform duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-1">
              {isDragging
                ? "Solte os arquivos aqui"
                : "Arraste arquivos ou clique para enviar"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md">
              PDF ou TXT, até {MAX_FILE_SIZE_MB} MB cada. Máx. {MAX_FILES} arquivos.
            </p>
          </div>

          {files.length > 0 && (
            <>
              <div className="bg-white/90 rounded-xl border border-slate-200 shadow-sm overflow-hidden backdrop-blur-sm transition-all duration-500 overflow-y-auto max-h-64 custom-scrollbar">
                <div className="p-3 md:p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
                  <h4 className="font-medium text-sm text-slate-700">
                    Arquivos selecionados ({files.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => setFiles([])}
                    className="text-[11px] md:text-xs text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-full px-2 py-1 transition-colors uppercase tracking-wider font-semibold"
                  >
                    Limpar tudo
                  </button>
                </div>
                <ul className="divide-y divide-slate-100 custom-scrollbar select-none">
                  {files.map((file, index) => (
                    <li
                      key={`${file.name}-${index}`}
                      className="p-3 md:p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-violet-100 to-violet-50 border border-violet-200 text-violet-500 shrink-0">
                          <FaFile className="size-4" />
                        </div>
                        <div className="flex flex-col truncate">
                          <span className="text-sm font-medium text-slate-800 truncate">
                            {file.name}
                          </span>
                          <span className="flex text-xs text-slate-500 justify-start">
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        aria-label="Remove file"
                      >
                        <TbTrash className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-center w-full pt-4">
                <Button
                  onClick={() => user?.id && handleUpload()}
                  className="bg-violet-500 hover:bg-violet-600 text-white rounded-full px-8 py-3 text-sm md:text-base font-semibold shadow-md transition-transform duration-200 hover:scale-105 disabled:opacity-60 disabled:hover:scale-100 cursor-pointer"
                  disabled={!user || isLoading}
                >
                  {isLoading ? "Enviando…" : "Enviar arquivos"}
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
