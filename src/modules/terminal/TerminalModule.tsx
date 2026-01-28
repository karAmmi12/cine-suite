import { useState, useEffect, useRef } from 'react';
import { useSceneStore } from '../../core/store/sceneStore';
import type { TerminalModuleConfig } from '../../core/types/schema';
import { useMagicTyping } from '../../core/hooks/useMagicTyping';
import { AlertTriangle, Shield, Server, Code } from 'lucide-react';

export const TerminalModule = () => {
  const scene = useSceneStore((state) => state.currentScene);
  const config = scene?.module as TerminalModuleConfig;

  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [lineIndex, setLineIndex] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { displayValue, isComplete } = useMagicTyping(config?.triggerText || "");

  // Couleurs et icônes selon contexte
  const getTheme = () => {
    switch (config.color) {
      case 'red': 
        return { 
          text: 'text-red-500', 
          border: 'border-red-500', 
          bg: 'bg-red-500',
          glow: 'shadow-red-500',
          icon: AlertTriangle,
          prompt: 'root@security-node'
        };
      case 'blue': 
        return { 
          text: 'text-cyan-400', 
          border: 'border-cyan-400', 
          bg: 'bg-cyan-400',
          glow: 'shadow-cyan-400',
          icon: Server,
          prompt: 'admin@prod-server-01'
        };
      case 'amber': 
        return { 
          text: 'text-amber-500', 
          border: 'border-amber-500', 
          bg: 'bg-amber-500',
          glow: 'shadow-amber-500',
          icon: Code,
          prompt: 'developer@ci-pipeline'
        };
      default: 
        return { 
          text: 'text-green-500', 
          border: 'border-green-500', 
          bg: 'bg-green-500',
          glow: 'shadow-green-500',
          icon: Shield,
          prompt: 'user@linux-workstation'
        };
    }
  };
  const theme = getTheme();
  const IconComponent = theme.icon;

  // Défilement séquentiel des logs (plus réaliste)
  useEffect(() => {
    if (!isComplete || !config.lines || lineIndex >= config.lines.length) return;

    const speed = config.typingSpeed === 'slow' ? 400 : config.typingSpeed === 'fast' ? 80 : 0;
    
    const timeout = setTimeout(() => {
      const line = config.lines[lineIndex];
      const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
      
      // Ajouter des préfixes réalistes selon le contexte (format syslog)
      let prefix = '';
      if (config.color === 'red') prefix = 'kernel:';
      else if (config.color === 'blue') prefix = 'sshd[2849]:';
      else if (config.color === 'amber') prefix = 'jenkins:';
      else prefix = 'systemd[1]:';
      
      setLogs(prev => [...prev, `[${timestamp}] ${prefix} ${line}`]);
      setLineIndex(prev => prev + 1);
      
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, speed);

    return () => clearTimeout(timeout);
  }, [isComplete, lineIndex, config]);

  // Barre de progression
  useEffect(() => {
    if (!isComplete || !config.showProgressBar) return;

    const duration = config.progressDuration * 1000;
    const intervalTime = 50;
    const step = 100 / (duration / intervalTime);

    const interval = setInterval(() => {
        setProgress(prev => {
            if (prev >= 100) {
                clearInterval(interval);
                setIsFinished(true);
                return 100;
            }
            return prev + step;
        });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isComplete, config]);

  if (!config) return null;

  return (
    <div className={`h-screen w-screen bg-black ${theme.text} font-mono p-4 md:p-8 overflow-hidden flex flex-col text-xs md:text-sm`}>
      
      {/* HEADER avec contexte */}
      <div className={`border-b ${theme.border} pb-2 mb-4 flex justify-between items-center flex-wrap gap-2`}>
        <div className="flex items-center gap-2">
          <IconComponent className="w-4 h-4" />
          <span className="font-bold">
            {config.color === 'red' ? 'IDS Alert - Intrusion Detection System' : 
             config.color === 'blue' ? 'ssh session - OpenSSH_8.9p1' : 
             config.color === 'amber' ? 'CI/CD Pipeline - Jenkins v2.401' : 
             'bash-5.1$ - GNU Bash'}
          </span>
        </div>
        <span className="text-xs opacity-70">
          {config.color === 'red' ? 'STATUS: COMPROMISED' :
           config.color === 'blue' ? 'UPTIME: 99.8%' :
           config.color === 'amber' ? 'MODE: RELEASE' :
           'CONNECTION: '}
          <span className="animate-pulse ml-1">
            {config.color === 'red' ? '⚠' : config.color === 'blue' ? '●' : config.color === 'amber' ? '⚙' : 'ENCRYPTED'}
          </span>
        </span>
      </div>

      {/* Informations système contextuelles */}
      <div className="mb-2 text-xs opacity-60 grid grid-cols-2 md:grid-cols-4 gap-2">
        <span>CPU: {Math.floor(Math.random() * 40 + 30)}%</span>
        <span>RAM: {Math.floor(Math.random() * 30 + 50)}%</span>
        <span>NET: {Math.floor(Math.random() * 100)}Mb/s</span>
        <span>DISK: {Math.floor(Math.random() * 20 + 70)}%</span>
      </div>

      {/* ZONE DE SAISIE */}
      <div className="mb-4">
        <span className="opacity-50">{theme.prompt}:~$ </span>
        <span>{displayValue}</span>
        {!isComplete && <span className={`inline-block w-2 h-4 ${theme.bg} ml-1 animate-pulse`}/>}
      </div>

      {/* LOGS DÉFILANTS avec style amélioré */}
      {isComplete && (
        <div className="flex-1 overflow-y-auto space-y-0.5 scrollbar-thin scrollbar-thumb-gray-700">
            {logs.map((log, i) => (
                <div 
                  key={i} 
                  className={`opacity-80 font-mono transition-opacity duration-300 ${
                    log.includes('kernel:') || log.includes('error') ? 'text-red-400' :
                    log.includes('jenkins:') || log.includes('warning') ? 'text-amber-400' :
                    log.includes('sshd') || log.includes('info') ? 'text-cyan-400' :
                    'text-green-400'
                  }`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {log}
                </div>
            ))}
            <div ref={bottomRef} />
        </div>
      )}

      {/* BARRE DE PROGRESSION améliorée */}
      {isComplete && config.showProgressBar && !isFinished && (
        <div className="mt-6 space-y-2">
          <div className={`border ${theme.border} p-1 relative h-10 bg-black/50`}>
              <div 
                  className={`h-full ${theme.bg} transition-all duration-100 opacity-50`} 
                  style={{ width: `${progress}%` }}
              />
              <div className={`absolute inset-0 flex items-center justify-center font-bold ${theme.text} text-shadow`}>
                  {config.color === 'red' ? 'Running nmap scan' :
                   config.color === 'blue' ? 'rsync --progress' :
                   config.color === 'amber' ? 'npm run build' :
                   'tar -xzvf'}... {Math.floor(progress)}%
              </div>
          </div>
          {/* Barre de détail */}
          <div className="text-xs opacity-60 flex justify-between">
            <span>{lineIndex}/{config.lines?.length || 0} operations</span>
            <span>ETA: {Math.max(0, Math.floor((100 - progress) / 10))}s</span>
          </div>
        </div>
      )}

      {/* ÉCRAN FINAL contextualisé */}
      {isFinished && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50 animate-in fade-in zoom-in duration-500">
            <div 
              className={`border-4 ${theme.border} bg-black p-8 md:p-12 text-center max-w-2xl mx-4`}
              style={{ 
                boxShadow: `0 0 80px ${
                  config.color === 'red' ? 'rgba(239, 68, 68, 0.6)' : 
                  config.color === 'blue' ? 'rgba(34, 211, 238, 0.6)' : 
                  config.color === 'amber' ? 'rgba(245, 158, 11, 0.6)' :
                  'rgba(34, 197, 94, 0.6)'
                }` 
              }}
            >
                <div className="mb-6 flex justify-center">
                    <IconComponent size={80} className={`${config.finalStatus === 'success' ? 'animate-bounce' : 'animate-pulse'}`} />
                </div>
                
                <h1 className="text-3xl md:text-6xl font-black tracking-wider mb-4">
                    {config.finalMessage}
                </h1>
                
                <div className={`text-lg md:text-2xl font-mono mb-4 ${config.finalStatus === 'success' ? theme.text : 'text-red-500'}`}>
                    {config.color === 'red' ? (
                      config.finalStatus === 'success' ? '✓ Firewall rules updated successfully' : '✗ segmentation fault (core dumped)'
                    ) : config.color === 'blue' ? (
                      config.finalStatus === 'success' ? '✓ Connection to server closed.' : '✗ ssh: connect to host refused'
                    ) : config.color === 'amber' ? (
                      config.finalStatus === 'success' ? '✓ Build completed: 0 errors, 0 warnings' : '✗ error TS2345: Type mismatch'
                    ) : (
                      config.finalStatus === 'success' ? '$ exit 0' : '$ exit 1'
                    )}
                </div>

                {/* Détails contextuels */}
                <div className="text-xs opacity-60 space-y-1">
                  <div>TIMESTAMP: {new Date().toISOString()}</div>
                  <div>OPERATIONS: {config.lines?.length || 0} completed</div>
                  <div>DURATION: {config.progressDuration}s</div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};