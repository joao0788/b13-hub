import { Layout } from "@/components/layout";
import { useGetKeyStats } from "@workspace/api-client-react";
import { Download, Terminal, ShieldAlert, Cpu, Activity, Copy, Package, FolderArchive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { data: stats, isLoading } = useGetKeyStats();
  const { toast } = useToast();

  const handleDownloadScript = () => {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    const link = document.createElement("a");
    link.href = base + "/b13-coringa.lua";
    link.download = "b13-coringa.lua";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPrompt = () => {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    const link = document.createElement("a");
    link.href = base + "/sistema-completo.txt";
    link.download = "B13-SISTEMA-COMPLETO.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadProject = () => {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    const link = document.createElement("a");
    link.href = base + "/b13-coringa-projeto.tar.gz";
    link.download = "b13-coringa-projeto.tar.gz";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadstringUrl = window.location.origin
    + import.meta.env.BASE_URL.replace(/\/$/, "")
    + "/b13-coringa.lua";
  const loadstringCmd = `loadstring(game:HttpGet("${loadstringUrl}"))()`;

  const copyLoadstring = () => {
    navigator.clipboard.writeText(loadstringCmd);
    toast({ title: "Copiado!", description: "Comando copiado para a área de transferência." });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-12">

        {/* HERO */}
        <section className="text-center space-y-6 py-12">
          <div className="text-xs text-primary font-mono tracking-[0.4em] mb-2 opacity-70">
            &gt; SISTEMA INICIALIZADO
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase cyber-glitch-text text-white">
            B13 CORINGA <span className="text-primary">FFH4X</span>
          </h1>
          <p className="text-lg text-muted-foreground font-mono max-w-2xl mx-auto">
            DOMINE O LOBBY. ATIVE O SCRIPT. SEM MISERICÓRDIA.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={handleDownloadScript}
              className="group px-8 py-4 bg-primary text-black font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2"
              data-testid="button-download-script"
            >
              <Download className="w-5 h-5 group-hover:animate-bounce" />
              Baixar Script (.lua)
            </button>
            <button
              onClick={handleDownloadProject}
              className="group px-8 py-4 bg-secondary border border-border text-white font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-colors flex items-center gap-2"
              data-testid="button-download-project"
            >
              <FolderArchive className="w-5 h-5" />
              Baixar Projeto Completo (.tar.gz)
            </button>
            <button
              onClick={handleDownloadPrompt}
              className="group px-6 py-4 bg-secondary border border-border text-muted-foreground font-bold uppercase tracking-widest hover:border-border hover:text-white transition-colors flex items-center gap-2 text-sm"
              data-testid="button-download-system"
            >
              <Package className="w-4 h-4" />
              Instruções (.txt)
            </button>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="cyber-box p-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Terminal className="w-4 h-4 text-primary" />
              <span className="text-xs uppercase tracking-wider">Total de Keys</span>
            </div>
            <div className="text-3xl font-bold text-white" data-testid="stat-total">
              {isLoading ? "—" : stats?.total ?? 0}
            </div>
          </div>
          <div className="cyber-box p-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-xs uppercase tracking-wider">Keys Ativas</span>
            </div>
            <div className="text-3xl font-bold text-primary" data-testid="stat-active">
              {isLoading ? "—" : stats?.active ?? 0}
            </div>
          </div>
          <div className="cyber-box p-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShieldAlert className="w-4 h-4 text-destructive" />
              <span className="text-xs uppercase tracking-wider">Expiradas</span>
            </div>
            <div className="text-3xl font-bold text-destructive" data-testid="stat-expired">
              {isLoading ? "—" : stats?.expired ?? 0}
            </div>
          </div>
          <div className="cyber-box p-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Cpu className="w-4 h-4 text-yellow-400" />
              <span className="text-xs uppercase tracking-wider">Permanentes</span>
            </div>
            <div className="text-3xl font-bold text-yellow-400" data-testid="stat-permanent">
              {isLoading ? "—" : stats?.permanent ?? 0}
            </div>
          </div>
        </section>

        {/* LOADSTRING */}
        <section className="cyber-box p-8 space-y-4">
          <h2 className="text-lg font-bold text-white uppercase flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" />
            Comando de Execução (cole no executor do Roblox)
          </h2>
          <div className="bg-black border border-border p-4 relative group">
            <code
              className="text-primary break-all font-mono text-sm pr-16"
              data-testid="text-loadstring"
            >
              {loadstringCmd}
            </code>
            <button
              onClick={copyLoadstring}
              className="absolute top-2 right-2 px-3 py-1.5 bg-secondary border border-border text-xs uppercase hover:bg-primary hover:text-black hover:border-primary transition-colors flex items-center gap-1"
              data-testid="button-copy-loadstring"
            >
              <Copy className="w-3 h-3" />
              Copiar
            </button>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            Este comando aponta para a versão hospedada mais recente da script.
            Ao publicar o site, o URL muda automaticamente para o domínio correto.
          </p>
        </section>

        {/* FUNCIONALIDADES */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white uppercase border-b border-border pb-3">
            Funcionalidades da Script
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              ["Aimbot + FOV RGB","Mira automática com círculo visual configurável"],
              ["ESP Caixa RGB","Caixa ao redor dos jogadores com cor animada"],
              ["ESP Esqueleto RGB","Esqueleto completo R6 e R15 com cor animada"],
              ["ESP Linha RGB","Linha do seu personagem até o inimigo"],
              ["ESP Distância","Mostra a distância em metros até cada jogador"],
              ["ESP Nome","Nome do jogador acima da caixa"],
              ["ESP Barra de Vida","Barra de HP ao lado da caixa"],
              ["WalkSpeed / JumpPower","Velocidade e pulo configuráveis via slider"],
              ["Pulo Infinito","Pule infinitamente sem tocar o chão"],
              ["Voar","Voo completo com WASD + Space + Ctrl"],
              ["NoClip","Atravesse paredes e objetos"],
              ["God Mode","Vida infinita, não morre"],
              ["Spin Bot","Rotação automática para desviar de tiros"],
              ["Sem Recuo","Câmera sem movimento ao atirar"],
              ["FullBright","Remove escuridão e névoa do mapa"],
              ["Anti Kick","Bloqueia expulsão forçada pelo servidor"],
              ["Anti AFK","Previne kick por inatividade"],
            ].map(([title, desc]) => (
              <div key={title} className="cyber-box p-4 space-y-1">
                <div className="text-sm font-bold text-primary uppercase">{title}</div>
                <div className="text-xs text-muted-foreground">{desc}</div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </Layout>
  );
}
