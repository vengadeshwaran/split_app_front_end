import React from "react";
import { SplitSquareHorizontal, Loader2 } from "lucide-react";

const SplashScreen = ({ status = "Connecting to server…" }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background-light dark:bg-background-dark px-6">
      <div className="w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/25 flex items-center justify-center animate-pulse">
        <SplitSquareHorizontal className="w-8 h-8 text-white" />
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-2xl font-black text-slate-800">SplitEasy</h1>
        <p className="text-sm text-slate-400">Split bills. Stay friends.</p>
      </div>

      <div className="flex items-center gap-2 text-slate-400 mt-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-xs font-medium">{status}</span>
      </div>
    </div>
  );
};

export default SplashScreen;
