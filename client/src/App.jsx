import { useEffect, useState } from "react";
import axiosInstance from "./lib/axios";

function App() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/health")
      .then((res) => setHealth(res.data))
      .catch((err) => setHealth({ success: false, message: err.message }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-surface border border-border rounded-2xl p-8 shadow-2xl animate-slide-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white">
            S
          </div>
          <h1 className="text-2xl font-bold tracking-tight">StudySync AI</h1>
        </div>

        <p className="text-muted mb-6 text-sm">
          Production-grade foundation • Phase 1 complete
        </p>

        <div className="border border-border rounded-xl p-4 bg-background/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Backend Health</span>
            {loading ? (
              <span className="text-xs text-muted">Checking...</span>
            ) : health?.success ? (
              <span className="text-xs text-success flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Connected
              </span>
            ) : (
              <span className="text-xs text-error">Disconnected</span>
            )}
          </div>
          {health && (
            <p className="text-xs text-muted mt-2 break-all">
              {health.message}
            </p>
          )}
        </div>

        <div className="mt-6 text-xs text-muted text-center">
          🚀 Ready for Phase 2: Authentication
        </div>
      </div>
    </div>
  );
}

export default App;