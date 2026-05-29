import { Layout } from "@/components/layout";
import { useValidateKey, getValidateKeyQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { Search, CheckCircle, XCircle, ShieldAlert, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const DURATION_LABELS: Record<string, string> = {
  "1min":      "1 Minuto",
  "1day":      "1 Dia",
  "3days":     "3 Dias",
  "7days":     "7 Dias",
  "30days":    "30 Dias",
  "permanent": "Permanente",
};

export default function Validate() {
  const [keyValue, setKeyValue]   = useState("");
  const [searchKey, setSearchKey] = useState("");

  const { data: validation, isLoading } = useValidateKey(searchKey, {
    query: {
      enabled: !!searchKey,
      queryKey: getValidateKeyQueryKey(searchKey),
    },
  });

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = keyValue.trim();
    if (trimmed) setSearchKey(trimmed);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8 py-12">

        <div className="text-center space-y-4">
          <ShieldAlert className="w-16 h-16 text-primary mx-auto" />
          <h1 className="text-4xl font-bold uppercase tracking-widest text-white">Validar Key</h1>
          <p className="text-muted-foreground font-mono">Verifique se uma key ainda está ativa</p>
        </div>

        <form onSubmit={handleValidate} className="cyber-box p-6 space-y-4">
          <div className="relative">
            <input
              type="text"
              value={keyValue}
              onChange={(e) => setKeyValue(e.target.value)}
              placeholder="Cole sua key aqui: B13-XXXXXXXXXXXXXXXX"
              className="w-full bg-black border border-border p-4 pl-12 text-white text-base focus:outline-none focus:border-primary font-mono placeholder:text-muted-foreground/30"
              data-testid="input-validate-key"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          </div>
          <button
            type="submit"
            disabled={!keyValue.trim() || isLoading}
            className="w-full bg-primary text-black font-bold uppercase py-4 hover:bg-white transition-colors text-lg disabled:opacity-50"
            data-testid="button-validate"
          >
            {isLoading ? "Verificando..." : "Verificar Key"}
          </button>
        </form>

        {isLoading && (
          <div className="text-center text-primary animate-pulse font-mono py-8">
            Consultando banco de dados...
          </div>
        )}

        {validation && !isLoading && (
          <div
            className={`cyber-box p-8 text-center space-y-6 ${
              validation.valid ? "border-primary bg-primary/5" : "border-destructive bg-destructive/5"
            }`}
          >
            {validation.valid ? (
              <>
                <CheckCircle className="w-16 h-16 text-primary mx-auto" />
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-primary uppercase">Acesso Liberado</h2>
                  <p className="text-white font-mono">{validation.message ?? "Key válida e ativa."}</p>
                </div>
                {validation.key && (
                  <div className="grid grid-cols-2 gap-4 text-left border-t border-primary/20 pt-6">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase mb-1">Duração</div>
                      <div className="text-white font-mono">
                        {DURATION_LABELS[validation.key.duration] ?? validation.key.duration}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase mb-1">Expira em</div>
                      <div className="text-white font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        {validation.key.expiresAt
                          ? format(new Date(validation.key.expiresAt), "dd/MM/yyyy HH:mm", { locale: ptBR })
                          : "Nunca"}
                      </div>
                    </div>
                    {validation.key.note && (
                      <div className="col-span-2">
                        <div className="text-xs text-muted-foreground uppercase mb-1">Observação</div>
                        <div className="text-primary font-mono">{validation.key.note}</div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <XCircle className="w-16 h-16 text-destructive mx-auto" />
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-destructive uppercase">Acesso Negado</h2>
                  <p className="text-muted-foreground font-mono">
                    {validation.message ?? "Key inválida ou expirada."}
                  </p>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </Layout>
  );
}
