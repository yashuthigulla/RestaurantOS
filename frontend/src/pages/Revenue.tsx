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

      <div className="flex-1 bg-gray-100 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Revenue</h1>

          <div className="flex gap-3">
            <button
              onClick={() => exportToCSV("revenue.csv", revenues)}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg"
            >
              Export CSV
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Add Revenue
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
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
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
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

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Save
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded border"
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
