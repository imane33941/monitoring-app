import { useEffect, useState } from 'react';
import {
  Activity, Plus, Trash2, RefreshCw, CheckCircle,
  XCircle, Clock, Wifi, AlertTriangle, X, ChevronRight,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useMonitorStore, Monitor, PingResult, MonitorStats } from './stores/useMonitorStore';

// ─── Badge de statut ───────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Monitor['status'] }) {
  const styles = {
    up: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    down: 'bg-red-100 text-red-700 border border-red-200',
    pending: 'bg-zinc-100 text-zinc-500 border border-zinc-200',
  };
  const icons = {
    up: <CheckCircle size={12} />,
    down: <XCircle size={12} />,
    pending: <Clock size={12} />,
  };
  const labels = { up: 'En ligne', down: 'Hors ligne', pending: 'En attente' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {icons[status]} {labels[status]}
    </span>
  );
}

// ─── Dot animé ────────────────────────────────────────────────────────────

function LiveDot({ status }: { status: Monitor['status'] }) {
  if (status === 'up') {
    return (
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
      </span>
    );
  }
  if (status === 'down') {
    return <span className="inline-flex rounded-full h-3 w-3 bg-red-500" />;
  }
  return <span className="inline-flex rounded-full h-3 w-3 bg-zinc-300" />;
}

// ─── Modal ajout monitor ───────────────────────────────────────────────────

function AddMonitorModal({ onClose }: { onClose: () => void }) {
  const { createMonitor } = useMonitorStore();
  const [form, setForm] = useState({
    name: '',
    url: '',
    intervalSeconds: 60,
    alertEmail: '',
    alertEnabled: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.url) return;
    setLoading(true);
    setError('');
    try {
      await createMonitor({
        ...form,
        alertEmail: form.alertEmail || undefined,
      });
      onClose();
    } catch {
      setError('Erreur lors de la création du monitor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-zinc-900">Ajouter un monitor</h2>
          <button onClick={onClose} className="p-1 hover:bg-zinc-100 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Nom</label>
            <input
              type="text"
              placeholder="Finance App — Production"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">URL à monitorer</label>
            <input
              type="url"
              placeholder="https://server-production.up.railway.app/api/health"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Intervalle de vérification
            </label>
            <select
              value={form.intervalSeconds}
              onChange={(e) => setForm({ ...form, intervalSeconds: Number(e.target.value) })}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            >
              <option value={30}>Toutes les 30 secondes</option>
              <option value={60}>Toutes les minutes</option>
              <option value={300}>Toutes les 5 minutes</option>
              <option value={600}>Toutes les 10 minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Email d'alerte (optionnel)
            </label>
            <input
              type="email"
              placeholder="imane@exemple.com"
              value={form.alertEmail}
              onChange={(e) => setForm({ ...form, alertEmail: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-600 hover:bg-zinc-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 disabled:opacity-50"
            >
              {loading ? 'Ajout...' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Détail monitor (drawer) ───────────────────────────────────────────────

function MonitorDetail({ monitor, onClose }: { monitor: Monitor; onClose: () => void }) {
  const { getStats, getHistory } = useMonitorStore();
  const [stats, setStats] = useState<MonitorStats | null>(null);
  const [history, setHistory] = useState<PingResult[]>([]);

  useEffect(() => {
    getStats(monitor.id).then(setStats);
    getHistory(monitor.id, 50).then(setHistory);
  }, [monitor.id]);

  const chartData = history
    .slice()
    .reverse()
    .map((r) => ({
      time: new Date(r.checkedAt).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      latency: r.latencyMs,
      status: r.status === 'up' ? 1 : 0,
    }));

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-xl bg-white shadow-2xl flex flex-col h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <LiveDot status={monitor.status} />
            <div>
              <h2 className="font-bold text-zinc-900">{monitor.name}</h2>
              <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-xs">{monitor.url}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-xl">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats 24h */}
          {stats && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-zinc-50 rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-zinc-900">{stats.uptimePercent}%</p>
                <p className="text-xs text-zinc-500 mt-1">Disponibilité 24h</p>
              </div>
              <div className="bg-zinc-50 rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-zinc-900">
                  {stats.avgLatency != null ? `${stats.avgLatency}ms` : '—'}
                </p>
                <p className="text-xs text-zinc-500 mt-1">Latence moy.</p>
              </div>
              <div className="bg-zinc-50 rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-red-500">{stats.downCount}</p>
                <p className="text-xs text-zinc-500 mt-1">Incidents 24h</p>
              </div>
            </div>
          )}

          {/* Graphe latence */}
          {chartData.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-700 mb-3">
                Latence (50 derniers pings)
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 10, fill: '#999' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#999' }}
                      unit="ms"
                      width={45}
                    />
                    <Tooltip
                      formatter={(v: number) => [`${v}ms`, 'Latence']}
                      contentStyle={{ borderRadius: 8, fontSize: 12 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="latency"
                      stroke="#18181b"
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Historique */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-700 mb-3">Historique des pings</h3>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {history.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-zinc-50 text-sm"
                >
                  <div className="flex items-center gap-2">
                    {r.status === 'up' ? (
                      <CheckCircle size={13} className="text-emerald-500" />
                    ) : (
                      <XCircle size={13} className="text-red-500" />
                    )}
                    <span className="text-zinc-500 text-xs">
                      {new Date(r.checkedAt).toLocaleString('fr-FR')}
                    </span>
                    {r.errorMessage && (
                      <span className="text-red-400 text-xs">{r.errorMessage}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    {r.statusCode && <span>HTTP {r.statusCode}</span>}
                    {r.latencyMs != null && (
                      <span
                        className={
                          r.latencyMs > 1000
                            ? 'text-orange-500'
                            : r.latencyMs > 500
                            ? 'text-yellow-500'
                            : 'text-emerald-500'
                        }
                      >
                        {r.latencyMs}ms
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Carte monitor ─────────────────────────────────────────────────────────

function MonitorCard({
  monitor,
  onClick,
}: {
  monitor: Monitor;
  onClick: () => void;
}) {
  const { deleteMonitor, pingNow } = useMonitorStore();
  const [pinging, setPinging] = useState(false);

  const handlePing = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setPinging(true);
    await pingNow(monitor.id);
    setPinging(false);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Supprimer "${monitor.name}" ?`)) {
      await deleteMonitor(monitor.id);
    }
  };

  const lastCheck = monitor.lastCheckedAt
    ? new Date(monitor.lastCheckedAt).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : null;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-zinc-100 p-5 hover:border-zinc-300 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <LiveDot status={monitor.status} />
          <div>
            <h3 className="font-semibold text-zinc-900 text-sm">{monitor.name}</h3>
            <p className="text-xs text-zinc-400 mt-0.5 max-w-[200px] truncate">{monitor.url}</p>
          </div>
        </div>
        <StatusBadge status={monitor.status} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-zinc-400">
          {monitor.lastLatencyMs != null && (
            <span className="flex items-center gap-1">
              <Wifi size={11} />
              {monitor.lastLatencyMs}ms
            </span>
          )}
          {lastCheck && (
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {lastCheck}
            </span>
          )}
          {monitor.consecutiveFailures > 0 && (
            <span className="flex items-center gap-1 text-red-400">
              <AlertTriangle size={11} />
              {monitor.consecutiveFailures} échec(s)
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handlePing}
            title="Ping maintenant"
            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700"
          >
            <RefreshCw size={13} className={pinging ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleDelete}
            title="Supprimer"
            className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-500"
          >
            <Trash2 size={13} />
          </button>
          <ChevronRight size={13} className="text-zinc-300" />
        </div>
      </div>
    </div>
  );
}

// ─── App principale ────────────────────────────────────────────────────────

export default function App() {
  const { monitors, loading, error, fetchMonitors } = useMonitorStore();
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<Monitor | null>(null);

  // Refresh automatique toutes les 30s
  useEffect(() => {
    fetchMonitors();
    const interval = setInterval(fetchMonitors, 30_000);
    return () => clearInterval(interval);
  }, []);

  const upCount = monitors.filter((m) => m.status === 'up').length;
  const downCount = monitors.filter((m) => m.status === 'down').length;
  const allUp = monitors.length > 0 && downCount === 0;

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-white border-b border-zinc-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-900 rounded-xl flex items-center justify-center">
              <Activity size={16} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-zinc-900 text-sm">Monitoring</h1>
              <p className="text-xs text-zinc-400">Finance App</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status global */}
            {monitors.length > 0 && (
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                  allUp
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${allUp ? 'bg-emerald-500' : 'bg-red-500'}`}
                />
                {allUp
                  ? 'Tous les services sont en ligne'
                  : `${downCount} service(s) hors ligne`}
              </div>
            )}

            <button
              onClick={fetchMonitors}
              className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700"
              title="Actualiser"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800"
            >
              <Plus size={15} />
              Ajouter
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Résumé chiffres */}
        {monitors.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-zinc-100 p-5">
              <p className="text-3xl font-bold text-zinc-900">{monitors.length}</p>
              <p className="text-sm text-zinc-400 mt-1">Services monitorés</p>
            </div>
            <div className="bg-white rounded-2xl border border-zinc-100 p-5">
              <p className="text-3xl font-bold text-emerald-600">{upCount}</p>
              <p className="text-sm text-zinc-400 mt-1">En ligne</p>
            </div>
            <div className="bg-white rounded-2xl border border-zinc-100 p-5">
              <p className="text-3xl font-bold text-red-500">{downCount}</p>
              <p className="text-sm text-zinc-400 mt-1">Hors ligne</p>
            </div>
          </div>
        )}

        {/* État vide */}
        {!loading && monitors.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Activity size={28} className="text-zinc-400" />
            </div>
            <h2 className="text-zinc-900 font-semibold mb-2">Aucun monitor</h2>
            <p className="text-zinc-400 text-sm mb-6">
              Ajoutez votre première URL à surveiller
            </p>
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800"
            >
              <Plus size={15} />
              Ajouter un monitor
            </button>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 text-sm mb-6">
            {error} — Le serveur NestJS est-il démarré sur le port 3001 ?
          </div>
        )}

        {/* Grille des monitors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {monitors.map((m) => (
            <MonitorCard
              key={m.id}
              monitor={m}
              onClick={() => setSelected(m)}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      {showAdd && <AddMonitorModal onClose={() => setShowAdd(false)} />}
      {selected && (
        <MonitorDetail monitor={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
