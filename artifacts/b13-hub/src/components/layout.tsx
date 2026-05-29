import { Link, useLocation } from "wouter";
import { Terminal, Key, ShieldCheck, Download } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItem = (href: string, label: string, current: string) =>
    `text-sm uppercase tracking-wider transition-colors hover:text-primary pb-0.5 ${
      current === href
        ? "text-primary border-b-2 border-primary"
        : "text-muted-foreground"
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-mono">
      <header className="border-b border-border bg-card/90 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Terminal className="w-6 h-6 text-primary group-hover:animate-pulse" />
            <span className="font-bold text-xl tracking-widest cyber-glitch-text uppercase">B13 CORINGA</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className={navItem("/", "Início", location)}>
              Início
            </Link>
            <Link href="/keys" className={navItem("/keys", "Gerador", location)}>
              [Gerador]
            </Link>
            <Link href="/validate" className={navItem("/validate", "Validar", location)}>
              Validar
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-border bg-card py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground font-mono space-y-1">
          <div>SISTEMA ATIVO // B13_CORINGA_FFH4X v2.0</div>
          <div>
            <a
              href="https://discord.gg/tDsNEjWT4j"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              discord.gg/tDsNEjWT4j
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
