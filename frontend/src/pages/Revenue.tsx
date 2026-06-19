import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { exportToCSV } from "../utils/exportCSV";

interface Revenue {
  id: number;
  title: string;
  amount: number;
  source: string;
  payment_method: string;
  outlet_id: number;
}

function Revenue() {
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [outletId, setOutletId] = useState("");

  const [editId, setEditId] = useState<number | null>(null);

  const fetchRevenues = async () => {
    const response = await api.get("/revenue/");
    setRevenues(response.data);
  };

  useEffect(() => {
    fetchRevenues();
  }, []);

  const startEditRevenue = (revenue: Revenue) => {
    setEditId(revenue.id);
    setTitle(revenue.title);
    setAmount(String(revenue.amount));
    setSource(revenue.source);
    setPaymentMethod(revenue.payment_method);
    setOutletId(String(revenue.outlet_id));
    setShowModal(true);
  };

  const createRevenue = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title,
      amount: Number(amount),
      source,
      payment_method: paymentMethod,
      outlet_id: Number(outletId),
    };

    if (editId) {
      await api.put(`/revenue/${editId}`, payload);
    } else {
      await api.post("/revenue/", payload);
    }

    setTitle("");
    setAmount("");
    setSource("");
    setPaymentMethod("");
    setOutletId("");
    setEditId(null);
    setShowModal(false);

    fetchRevenues();
  };

  const deleteRevenue = async (id: number) => {
    await api.delete(`/revenue/${id}`);
    fetchRevenues();
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="min-w-0 flex-1 bg-gray-100 p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Revenue</h1>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => exportToCSV("revenue.csv", revenues)}
              className="rounded-lg bg-slate-900 px-4 py-2 text-white"
            >
              Export CSV
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Add Revenue
            </button>
          </div>
        </div>

        <div className="space-y-4 md:hidden">
          {revenues.map((revenue) => (
            <article key={revenue.id} className="rounded-xl bg-white p-4 shadow">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">Revenue #{revenue.id}</p>
                  <h2 className="truncate text-lg font-bold">{revenue.title}</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    {revenue.source} - {revenue.payment_method}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Outlet {revenue.outlet_id}
                  </p>
                </div>

                <p className="shrink-0 font-semibold text-green-600">
                  &#8377;{revenue.amount}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => startEditRevenue(revenue)}
                  className="rounded bg-yellow-500 px-3 py-2 text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteRevenue(revenue.id)}
                  className="rounded bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="hidden overflow-x-auto rounded-xl bg-white shadow md:block">
          <table className="w-full min-w-[900px]">
            <thead className="bg-green-700 text-white">
              <tr>
                <th className="p-4 text-left">ID</th>
                <th className="p-4 text-left">Title</th>
                <th className="p-4 text-left">Source</th>
                <th className="p-4 text-left">Payment</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-left">Outlet ID</th>
                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {revenues.map((revenue) => (
                <tr key={revenue.id} className="border-b">
                  <td className="p-4">{revenue.id}</td>
                  <td className="p-4">{revenue.title}</td>
                  <td className="p-4">{revenue.source}</td>
                  <td className="p-4">{revenue.payment_method}</td>
                  <td className="p-4 text-green-600 font-semibold">
                    ₹{revenue.amount}
                  </td>
                  <td className="p-4">{revenue.outlet_id}</td>
                  <td className="p-4">
                    <button
                      onClick={() => startEditRevenue(revenue)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteRevenue(revenue.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4">
                {editId ? "Edit Revenue" : "Add Revenue"}
              </h2>

              <form onSubmit={createRevenue}>
                <input
                  className="w-full border p-2 mb-3 rounded"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <input
                  className="w-full border p-2 mb-3 rounded"
                  placeholder="Amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />

                <input
                  className="w-full border p-2 mb-3 rounded"
                  placeholder="Source"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                />

                <input
                  className="w-full border p-2 mb-3 rounded"
                  placeholder="Payment Method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />

                <input
                  className="w-full border p-2 mb-3 rounded"
                  placeholder="Outlet ID"
                  type="number"
                  value={outletId}
                  onChange={(e) => setOutletId(e.target.value)}
                />

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                  >
                    Save
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded border px-4 py-2"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Revenue;
