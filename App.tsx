
import React, { useState, useCallback, useRef } from 'react';
import { GeminiService } from './services/geminiService';
import { PosterData } from './types';
import { Button } from './components/Button';
import { 
  Upload, 
  RefreshCw, 
  Download, 
  History, 
  Sparkles, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  MessageSquare,
  Cpu,
  Shield,
  Database,
  Users,
  Calendar,
  Timer
} from 'lucide-react';

const gemini = new GeminiService();

const DivisionIcon = ({ division }: { division?: string }) => {
  switch (division) {
    case 'Development': return <Cpu className="w-4 h-4" />;
    case 'Cyber': return <Shield className="w-4 h-4" />;
    case 'Data Science': return <Database className="w-4 h-4" />;
    case 'Capacity Building': return <Users className="w-4 h-4" />;
    default: return <Calendar className="w-4 h-4" />;
  }
};

const App: React.FC = () => {
  const [data, setData] = useState<PosterData>({
    originalImage: '',
    userInstructions: '',
    status: 'idle'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setData(prev => ({
          ...prev,
          originalImage: e.target?.result as string,
          status: 'idle',
          division: undefined,
          remasteredImage: undefined
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const startRemaster = async () => {
    if (!data.originalImage) return;

    try {
      setData(prev => ({ ...prev, status: 'analyzing', error: undefined }));
      
      // Step 1: Analyze original and detect division
      const { text, division } = await gemini.analyzePoster(data.originalImage);
      
      setData(prev => ({ ...prev, status: 'generating', extractedText: text, division: division as any }));

      // Step 2: Generate remastered version with division style
      const remasteredImage = await gemini.generateRemasteredPoster(text, division, data.userInstructions);

      setData(prev => ({
        ...prev,
        remasteredImage,
        status: 'completed'
      }));
    } catch (err: any) {
      console.error(err);
      setData(prev => ({
        ...prev,
        status: 'error',
        error: err.message || "An unexpected error occurred. Please try again."
      }));
    }
  };

  const reset = () => {
    setData({ originalImage: '', userInstructions: '', status: 'idle' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadResult = () => {
    if (!data.remasteredImage) return;
    const link = document.createElement('a');
    link.href = data.remasteredImage;
    link.download = `csec-remastered-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <nav className="border-b border-white/5 py-4 px-6 flex justify-between items-center bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight">CSEC <span className="text-indigo-500">LABS</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hidden sm:flex">CHALLENGE #01</Button>
          <div className="h-6 w-[1px] bg-white/10 hidden sm:block"></div>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
            <span className="text-xs font-medium text-white/70">PRO MODE</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-7xl font-extrabold mb-6 tracking-tight">
            The <span className="gradient-text">Time Travel</span> Fix
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
            Remaster messy, outdated posters with division-specific professional patterns. 
            AI-driven style detection for Development, Cyber, Data Science, and more.
          </p>
        </div>

        {/* Action Area */}
        <div className="space-y-12">
          {!data.originalImage ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group cursor-pointer max-w-2xl mx-auto p-12 border-2 border-dashed border-white/10 hover:border-indigo-500/50 rounded-3xl bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 text-center"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileUpload}
              />
              <div className="w-20 h-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-10 h-10 text-indigo-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Upload the "Before" Poster</h3>
              <p className="text-white/40">Drop your screenshot here or click to browse</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Left Column: Original and Controls */}
              <div className="space-y-6">
                <div className="relative group">
                  <div className="absolute -top-4 -left-4 bg-indigo-600 px-4 py-1 rounded-lg text-sm font-bold shadow-lg z-10 uppercase">Before</div>
                  <div className="rounded-2xl overflow-hidden border border-white/10 aspect-[3/4] glass flex items-center justify-center bg-black/40">
                    <img src={data.originalImage} className="w-full h-full object-contain" alt="Original" />
                  </div>
                </div>

                {/* Status & Instructions */}
                <div className="glass p-6 rounded-2xl border-white/10 space-y-4">
                  {data.division && (
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                      <span className="text-xs text-white/40 uppercase tracking-widest">Division Detected</span>
                      <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-indigo-400 font-bold text-xs uppercase">
                        <DivisionIcon division={data.division} />
                        {data.division}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-white/80 font-medium">
                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                    <label htmlFor="instructions">Style Direction (Optional)</label>
                  </div>
                  <textarea
                    id="instructions"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all min-h-[100px] resize-none"
                    placeholder="E.g. 'Make it look extra futuristic', 'Use a clean Apple-style aesthetic'..."
                    value={data.userInstructions}
                    onChange={(e) => setData(prev => ({ ...prev, userInstructions: e.target.value }))}
                    disabled={data.status === 'analyzing' || data.status === 'generating'}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  {data.status !== 'error' && (
                    <Button 
                      onClick={startRemaster} 
                      className="flex-1 text-lg py-4"
                      isLoading={data.status === 'analyzing' || data.status === 'generating'}
                    >
                      <Sparkles className="w-5 h-5" />
                      {data.status === 'completed' ? 'Regenerate' : 'Remaster Poster'}
                    </Button>
                  )}
                  {data.status === 'error' && (
                    <Button 
                      onClick={startRemaster} 
                      className="flex-1 text-lg py-4"
                      variant="danger"
                    >
                      <RefreshCw className="w-5 h-5" />
                      Try Again
                    </Button>
                  )}
                  {data.status === 'completed' && data.remasteredImage && (
                    <Button 
                      onClick={downloadResult} 
                      className="flex-1 text-lg py-4"
                      variant="secondary"
                    >
                      <Download className="w-5 h-5" />
                      Download
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    onClick={reset}
                    disabled={data.status === 'analyzing' || data.status === 'generating'}
                  >
                    Reset
                  </Button>
                </div>
              </div>

              {/* Right Column: Result */}
              <div className="space-y-6">
                {(data.status === 'analyzing' || data.status === 'generating') && (
                  <div className="rounded-2xl border border-white/10 aspect-[3/4] glass flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-20 h-20 bg-indigo-600/10 rounded-full flex items-center justify-center mb-8 relative">
                       <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
                       <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-full animate-ping"></div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">
                      {data.status === 'analyzing' ? 'Detecting Division...' : 'Applying Tech Pattern...'}
                    </h3>
                    <div className="w-full max-w-xs h-2 bg-white/5 rounded-full overflow-hidden mb-6">
                      <div className={`h-full bg-indigo-500 transition-all duration-[3000ms] ${data.status === 'analyzing' ? 'w-1/2' : 'w-full'}`}></div>
                    </div>
                    {data.division && (
                      <div className="flex items-center gap-2 text-indigo-400 font-bold px-4 py-2 bg-indigo-500/5 rounded-lg border border-indigo-500/10 mb-4">
                        <DivisionIcon division={data.division} />
                        Using {data.division} Design DNA
                      </div>
                    )}
                    <p className="text-white/40 italic text-sm">Our AI is drafting a 2025 masterpiece...</p>
                  </div>
                )}

                {data.status === 'completed' && data.remasteredImage && (
                  <div className="relative group">
                    <div className="absolute -top-4 -right-4 bg-green-600 px-4 py-1 rounded-lg text-sm font-bold shadow-lg z-10 flex items-center gap-2 uppercase">
                      <CheckCircle2 className="w-4 h-4" /> After
                    </div>
                    <div className="rounded-2xl overflow-hidden border border-white/10 aspect-[3/4] glass flex items-center justify-center bg-black/40">
                      <img src={data.remasteredImage} className="w-full h-full object-contain" alt="Remastered" />
                    </div>
                  </div>
                )}

                {!['analyzing', 'generating', 'completed'].includes(data.status) && (
                   <div className="rounded-2xl border-2 border-dashed border-white/5 aspect-[3/4] flex flex-col items-center justify-center p-8 text-center bg-white/[0.01]">
                      <ImageIcon className="w-16 h-16 text-white/10 mb-4" />
                      <p className="text-white/20">The AI remastered version will appear here</p>
                   </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Division Legend */}
        <div className="mt-32 border-t border-white/5 pt-20">
          <h3 className="text-center text-3xl font-bold mb-12">Intelligent Design DNA</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { name: 'Development', icon: Cpu, desc: 'Grid/Code UI' },
              { name: 'Cyber', icon: Shield, desc: 'Secure Dark UI' },
              { name: 'Data Science', icon: Database, desc: 'Network Vibe' },
              { name: 'Competitive Programming', icon: Timer, desc: 'Speed/Precision' },
              { name: 'Capacity', icon: Users, desc: 'Growth/Social' },
              { name: 'Events', icon: Calendar, desc: 'Dynamic/Cinematic' }
            ].map((div) => (
              <div key={div.name} className="glass p-6 rounded-2xl border-white/5 text-center">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div.icon className="w-5 h-5 text-indigo-400" />
                </div>
                <h5 className="font-bold text-xs mb-1 uppercase tracking-tighter">{div.name}</h5>
                <p className="text-[10px] text-white/30">{div.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-white/5 py-12 px-6 mt-20 text-center">
        <p className="text-white/30 text-sm">
          &copy; 2025 CSEC Social Media Team. Professional AI Remastering.
        </p>
      </footer>
    </div>
  );
};

export default App;
