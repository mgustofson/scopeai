import IntakeForm from "@/components/IntakeForm";
import EstimationBoard from "@/components/EstimationBoard";
import OptimizationSidebar from "@/components/OptimizationSidebar";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold font-mono">S</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Scope.ai</h1>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold tracking-wider uppercase">Beta</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-500">
            <a href="#" className="text-blue-600">Plan & Estimate</a>
            <a href="#" className="hover:text-slate-800 transition-colors">Export Console</a>
          </nav>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <div className="max-w-6xl mx-auto px-6 mt-10">
        
        {/* Intro */}
        <div className="mb-10 max-w-3xl">
          <h2 className="text-4xl font-black tracking-tight mb-4 text-slate-900">Project Estimation</h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            Define your application's components below. Scope.ai utilizes heuristic calculations and active model pricing to estimate token consumption and budget prior to kicking off your AI-assisted build.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (Intake & Optimization) - 4 cols */}
          <div className="lg:col-span-4 sticky top-24 space-y-6">
            <IntakeForm />
            <OptimizationSidebar />
          </div>
          
          {/* Right Column (Estimations) - 8 cols */}
          <div className="lg:col-span-8">
            <EstimationBoard />
          </div>

        </div>

      </div>
    </main>
  );
}
