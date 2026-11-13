import React, { useState } from 'react';
import { X, Copy, Check, Terminal, FolderTree, Rocket, ExternalLink, Database, FileText } from 'lucide-react';
import { motion } from 'motion/react';

interface DeploymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'single-command' | 'mvc-env' | 'structure' | 'vercel'>('single-command');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs"
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl z-10 max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                Digiaccel Full-Stack Architecture & Vercel Guide
              </h2>
              <p className="text-xs text-gray-500">
                Single Command • MVC Backend • db_used Toggle • Vercel Deploy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 px-6 gap-4 sm:gap-6 text-xs sm:text-sm font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('single-command')}
            className={`py-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'single-command'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Single Command
          </button>

          <button
            onClick={() => setActiveTab('mvc-env')}
            className={`py-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'mvc-env'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Database className="w-4 h-4" />
            MVC & db_used Config
          </button>

          <button
            onClick={() => setActiveTab('structure')}
            className={`py-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'structure'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            Folder Structure
          </button>

          <button
            onClick={() => setActiveTab('vercel')}
            className={`py-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'vercel'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            Deploy on Vercel
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-gray-700">
          {/* TAB 1: Single Command */}
          {activeTab === 'single-command' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-1 flex items-center gap-2 text-sm">
                  ⚡ Single Command to Run Both Frontend & Backend
                </h3>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Inside the <code className="font-mono bg-blue-100 px-1 py-0.5 rounded">digiaccel-task</code> root directory,
                  we configured <code className="font-mono bg-blue-100 px-1 py-0.5 rounded">concurrently</code> in the root{' '}
                  <code className="font-mono bg-blue-100 px-1 py-0.5 rounded">package.json</code>. Running{' '}
                  <strong className="underline">npm run dev</strong> starts both the Express API and Vite React client simultaneously!
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold uppercase text-gray-500">1. Install all dependencies</span>
                  <button
                    onClick={() => copyToClipboard('npm run install:all', 'cmd1')}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    {copiedId === 'cmd1' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === 'cmd1' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="p-3 bg-gray-900 text-gray-100 rounded-xl font-mono text-xs overflow-x-auto">
cd digiaccel-task
npm run install:all
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold uppercase text-gray-500">2. Run Both with Single Command</span>
                  <button
                    onClick={() => copyToClipboard('npm run dev', 'cmd2')}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    {copiedId === 'cmd2' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === 'cmd2' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="p-3 bg-gray-900 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto">
npm run dev
                </pre>
                <p className="text-xs text-gray-500 mt-1">
                  • Backend API runs on: <span className="font-mono text-gray-700">http://localhost:5000</span><br />
                  • Frontend UI runs on: <span className="font-mono text-gray-700">http://localhost:5173</span>
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: MVC & db_used Config */}
          {activeTab === 'mvc-env' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200">
                <h3 className="font-bold text-amber-900 mb-1 flex items-center gap-2 text-sm">
                  🎛️ MVC Architecture with Dynamic Storage Switch (db_used)
                </h3>
                <p className="text-xs text-amber-800 leading-relaxed">
                  The backend does NOT keep all code in a single file. Instead, it follows a strict <strong>Model-View-Controller + Repository</strong> pattern.
                  Configure <code className="font-mono bg-amber-100 px-1 py-0.5 rounded font-bold">db_used</code> in <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">backend/.env</code>:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-xs mb-1">
                    <Database className="w-4 h-4 text-blue-600" />
                    <span>When db_used=true</span>
                  </div>
                  <p className="text-xs text-blue-700">
                    Connects to <strong>MongoDB</strong> (via Mongoose). All CRUD operations, status toggling, and queries execute directly against the Database.
                  </p>
                </div>

                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs mb-1">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>When db_used=false</span>
                  </div>
                  <p className="text-xs text-emerald-700">
                    Stores all items in the <strong>File Directory</strong> (<code className="font-mono text-[11px] bg-emerald-100 px-1 rounded">data/tasks.json</code>) using async filesystem operations (<code className="font-mono text-[11px]">fs/promises</code>).
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold uppercase text-gray-500">backend/.env</span>
                  <button
                    onClick={() => copyToClipboard(`db_used=false\nPORT=5000\nMONGODB_URI=mongodb://127.0.0.1:27017/digiaccel_tasks`, 'envcfg')}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    {copiedId === 'envcfg' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy .env
                  </button>
                </div>
                <pre className="p-3 bg-gray-900 text-gray-100 rounded-xl font-mono text-xs overflow-x-auto">
{`# Database Mode Configuration
# Set db_used=true to use MongoDB Database
# Set db_used=false to use local File Directory storage (JSON file in data/tasks.json)
db_used=false

PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB Connection String (used when db_used=true)
MONGODB_URI=mongodb://127.0.0.1:27017/digiaccel_tasks`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: Folder Structure */}
          {activeTab === 'structure' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-600 leading-relaxed">
                Single root <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">digiaccel-task</code> containing{' '}
                <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">frontend</code> and{' '}
                <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">backend</code> directories:
              </p>

              <pre className="p-4 bg-gray-900 text-gray-100 rounded-2xl font-mono text-xs leading-relaxed overflow-x-auto">
{`digiaccel-task/
├── package.json                 # Single-command orchestrator (npm run dev)
├── vercel.json                  # Vercel deployment configuration
├── README.md                    # Project documentation
├── VERCEL_DEPLOYMENT_GUIDE.md   # Complete step-by-step Vercel guide
│
├── backend/                     # Express REST API (Strict MVC Architecture)
│   ├── package.json             # Express, Mongoose, Cors, Dotenv
│   ├── tsconfig.json
│   ├── .env.example             # db_used=true / db_used=false
│   └── src/
│       ├── config/
│       │   └── db.ts            # Mongoose MongoDB connection
│       ├── models/
│       │   └── Task.ts          # Mongoose Schema & ITask Interface
│       ├── repositories/
│       │   ├── ITaskRepository.ts    # Contract
│       │   ├── dbTaskRepository.ts   # MongoDB implementation
│       │   ├── fileTaskRepository.ts # File Directory JSON implementation
│       │   └── index.ts              # Switches based on db_used
│       ├── controllers/
│       │   └── taskController.ts     # Request validation & logic
│       ├── routes/
│       │   └── taskRoutes.ts         # REST API endpoints
│       ├── data/
│       │   └── tasks.json            # Persistent JSON file directory
│       └── server.ts                 # Server entry point
│
└── frontend/                    # React + Vite + Tailwind Mobile UI
    ├── package.json
    ├── vite.config.ts           # Proxy to backend on port 5000
    ├── index.html
    └── src/
        ├── App.tsx              # Main mobile container
        ├── api.ts               # REST API client
        └── components/          # Figma 4 screens (Onboarding, Home, New Task, Search)`}
              </pre>
            </div>
          )}

          {/* TAB 4: Vercel Deploy */}
          {activeTab === 'vercel' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
                <h4 className="font-bold text-emerald-900 text-xs flex items-center gap-1.5 mb-1">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Ready for Free Vercel Deployment
                </h4>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Both the frontend and the serverless Express API endpoints can be deployed directly to Vercel using the included <code className="font-mono bg-emerald-100 px-1 py-0.5 rounded">vercel.json</code>.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 text-xs uppercase tracking-wide">
                  Step 1: Push to GitHub
                </h4>
                <pre className="p-3 bg-gray-900 text-gray-200 rounded-xl font-mono text-xs overflow-x-auto">
{`cd digiaccel-task
git init
git add .
git commit -m "feat: complete Digiaccel SDE-1 assignment"
git branch -M main
git remote add origin https://github.com/<your-username>/digiaccel-task.git
git push -u origin main`}
                </pre>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 text-xs uppercase tracking-wide">
                  Step 2: Import into Vercel
                </h4>
                <ol className="list-decimal list-inside text-xs text-gray-600 space-y-1.5 pl-1">
                  <li>Go to <strong>https://vercel.com</strong> and click <strong>"Add New Project"</strong>.</li>
                  <li>Import your GitHub repository <strong>digiaccel-task</strong>.</li>
                  <li>
                    In <strong>Build and Output Settings</strong>:
                    <ul className="list-disc list-inside pl-4 text-gray-500 mt-1 space-y-0.5">
                      <li>Framework Preset: <strong>Vite</strong></li>
                      <li>Root Directory: <strong>./</strong></li>
                      <li>Build Command: <strong>npm run build</strong></li>
                      <li>Output Directory: <strong>dist</strong></li>
                    </ul>
                  </li>
                  <li>Set environment variables: <code className="font-mono bg-gray-100 px-1 rounded">db_used=false</code> (or provide MongoDB URI).</li>
                  <li>Click <strong>Deploy</strong>!</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Files stored in <code className="font-mono font-semibold text-gray-700">/digiaccel-task</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </motion.div>
    </div>
  );
};
