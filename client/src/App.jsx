import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { healthService } from "./services/health.service";

function App() {
  const [status, setStatus] = useState("loading");
  const [data, setData] = useState(null);

  useEffect(() => {
    healthService
      .check()
      .then((res) => {
        setData(res.data);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass rounded-2xl p-8 max-w-md w-full shadow-2xl"
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">StudySync AI</h1>
            <p className="text-xs text-muted">Foundation Health Check</p>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-background/50 rounded-xl p-6 border border-border">
          {status === "loading" && (
            <div className="flex items-center gap-3 text-muted">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Connecting to backend...</span>
            </div>
          )}

          {status === "success" && data && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">All systems operational</span>
              </div>
              <div className="space-y-2 text-sm">
                <Row label="Service" value={data.service} />
                <Row label="Status" value={data.status} />
                <Row label="Environment" value={data.environment} />
                <Row
                  label="Uptime"
                  value={`${data.uptime.toFixed(2)}s`}
                />
              </div>
            </motion.div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-3 text-error">
              <XCircle className="w-5 h-5" />
              <span>Backend unreachable. Is the server running?</span>
            </div>
          )}
        </div>

        <p className="text-xs text-muted/60 text-center mt-6">
          Phase 1 · Foundation Setup Complete
        </p>
      </motion.div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted">{label}</span>
      <span className="text-white font-mono text-xs">{value}</span>
    </div>
  );
}

export default App;
