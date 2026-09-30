import TransparansiTables from "@/components/Tabelkeuangan";

export default function TransparansiPage() {
  return (
    <main className="p-6 max-w-7xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Transparansi Keuangan
      </h1>

      <TransparansiTables />
    </main>
  );
}