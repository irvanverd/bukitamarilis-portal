import DashboardChart from "@/components/DashboardChart";

async function getData() {
  const res = await fetch(
    //live :   `${process.env.NEXT_PUBLIC_SITE_URL}/api/finance`,
    "http://localhost:3001/api/finance",
    {
      cache: "no-store",
    }
  );

  return res.json();
}

export default async function TransparansiPage() {
  const data = await getData();

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Transparansi Keuangan
      </h1>

      <DashboardChart data={data} />
    </main>
  );
}