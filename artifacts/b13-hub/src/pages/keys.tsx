import { Layout } from "@/components/layout";
import {
  useListKeys,
  useGenerateKey,
  useRevokeKey,
  getListKeysQueryKey,
  getGetKeyStatsQueryKey,
} from "@workspace/api-client-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Key as KeyIcon, Trash2, Copy, Plus, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DURATIONS = [
  { value: "1min",      label: "1 Minuto (Teste)" },
  { value: "1day",      label: "1 Dia" },
  { value: "3days",     label: "3 Dias" },
  { value: "7days",     label: "7 Dias" },
  { value: "30days",    label: "30 Dias" },
  { value: "permanent", label: "Permanente" },
] as const;

type Duration = typeof DURATIONS[number]["value"];

function StatusBadge({ item }: { item: { active: boolean; expiresAt: string | null } }) {
  if (!item.active) {
    return <span className="px-2 py-0.5 bg-destructive/20 text-destructive text-xs uppercase border border-destructive/50">Revogada</span>;
  }
  if (item.expiresAt && new Date(item.expiresAt) <= new Date()) {
    return <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs uppercase border border-yellow-500/50">Expirada</span>;
  }
  return <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs uppercase border border-primary/50">Ativa</span>;
}

export default function Keys() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: keys, isLoading } = useListKeys();
  const generateMutation = useGenerateKey();
  const revokeMutation   = useRevokeKey();

  const [duration, setDuration] = useState<Duration>("1day");
  const [note, setNote] = useState("");

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListKeysQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetKeyStatsQueryKey() });
  };

  const handleGenerate = () => {
    generateMutation.mutate({ data: { duration, note: note || undefined } }, {
      onSuccess: (newKey) => {
        toast({ title: "Key gerada!", description: newKey.keyValue });
        setNote("");
        invalidate();
      },
      onError: () => toast({ title: "Erro ao gerar key", variant: "destructive" }),
    });
  };

  const handleRevoke = (id: number) => {
    revokeMutation.mutate({ id }, {
      onSuccess: () => { toast({ title: "Key revogada!" }); invalidate(); },
      onError:   () => toast({ title: "Erro ao revogar key", variant: "destructive" }),
    });
  };

  const copyKey = (val: string) => {
    navigator.clipboard.writeText(val);
    toast({ title: "Copiado!", description: val });
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">

        <div className="flex items-center gap-3 border-b border-border pb-4">
          <KeyIcon className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold uppercase tracking-widest text-white">Gerador de Keys</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* FORMULÁRIO */}
          <div className="lg:col-span-1">
            <div className="cyber-box p-6 space-y-6 sticky top-24">
              <h2 className="text-lg font-bold uppercase text-primary border-b border-border pb-2">
                Nova Key
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase text-muted-foreground block">Duração</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value as Duration)}
                    className="w-full bg-black border border-border p-3 text-white focus:outline-none focus:border-primary font-mono"
                    data-testid="select-duration"
                  >
                    {DURATIONS.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase text-muted-foreground block">Observação (opcional)</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="ex: VIP_USER_1"
                    className="w-full bg-black border border-border p-3 text-white focus:outline-none focus:border-primary font-mono placeholder:text-muted-foreground/40"
                    data-testid="input-note"
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                  className="w-full bg-primary text-black font-bold uppercase py-3 hover:bg-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  data-testid="button-generate"
                >
                  <Plus className="w-4 h-4" />
                  {generateMutation.isPending ? "Gerando..." : "Gerar Key"}
                </button>
              </div>
            </div>
          </div>

          {/* LISTA */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold uppercase text-white">
              Keys Geradas
              {keys && <span className="ml-2 text-muted-foreground text-sm">({keys.length})</span>}
            </h2>

            {isLoading ? (
              <div className="text-primary animate-pulse font-mono py-8">Carregando registros...</div>
            ) : !keys?.length ? (
              <div className="cyber-box p-8 text-center text-muted-foreground font-mono">
                Nenhuma key gerada ainda.
              </div>
            ) : (
              <div className="space-y-3">
                {keys.map((k) => (
                  <div
                    key={k.id}
                    className="cyber-box p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    data-testid={`card-key-${k.id}`}
                  >
                    <div className="space-y-1.5 overflow-hidden flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="font-mono text-base text-white truncate"
                          data-testid={`text-key-${k.id}`}
                        >
                          {k.keyValue}
                        </span>
                        <button
                          onClick={() => copyKey(k.keyValue)}
                          className="text-muted-foreground hover:text-primary transition-colors p-1 shrink-0"
                          title="Copiar key"
                          data-testid={`button-copy-${k.id}`}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <StatusBadge item={k} />
                      </div>
                      <div className="text-xs text-muted-foreground flex gap-3 font-mono flex-wrap">
                        <span>Duração: {DURATIONS.find(d => d.value === k.duration)?.label ?? k.duration}</span>
                        {k.expiresAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Expira: {format(new Date(k.expiresAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </span>
                        )}
                        {!k.expiresAt && <span className="text-yellow-400">Sem expiração</span>}
                        {k.note && <span className="text-primary/70">Obs: {k.note}</span>}
                      </div>
                    </div>

                    {k.active && (
                      <button
                        onClick={() => handleRevoke(k.id)}
                        disabled={revokeMutation.isPending}
                        className="px-4 py-2 bg-destructive/10 text-destructive border border-destructive hover:bg-destructive hover:text-white transition-colors text-sm uppercase shrink-0 flex items-center gap-2 disabled:opacity-50"
                        data-testid={`button-revoke-${k.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                        Revogar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </Layout>
  );
}
