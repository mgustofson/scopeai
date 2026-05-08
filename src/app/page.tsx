import IntakeForm from "@/components/IntakeForm";
import EstimationBoard from "@/components/EstimationBoard";

export default function Home() {
  return (
    <main className="min-h-screen bg-secondary/30 text-foreground p-4 md:p-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <div className="lg:col-span-4 lg:sticky lg:top-10">
          <IntakeForm />
        </div>
        <div className="lg:col-span-8">
          <EstimationBoard />
        </div>
      </div>
    </main>
  );
}
