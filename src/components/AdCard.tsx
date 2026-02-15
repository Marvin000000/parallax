export function AdCard() {
  return (
    <div className="p-4 rounded-lg border border-slate-700 bg-slate-800/50 flex flex-col items-center text-center space-y-2">
      <span className="text-[10px] uppercase tracking-wider text-slate-500">Sponsored</span>
      <div className="w-full h-32 bg-slate-700 rounded animate-pulse flex items-center justify-center text-slate-500 text-xs">
        {/* Placeholder for Ad Script (e.g. Carbon/EthicalAds) */}
        Ad Space (Target: Tech-Optimist Cluster)
      </div>
      <p className="text-xs text-slate-400">
        Support Parallax by checking out our sponsors.
      </p>
    </div>
  );
}
