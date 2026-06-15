import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { exportToCSV } from "../utils/exportCSV";

interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;
  outlet_id: number;
}

function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [outletId, setOutletId] = useState("");

  const [editId, setEditId] = useState<number | null>(null);

  const fetchExpenses = async () => {
    const response = await api.get("/expenses/");
    setExpenses(response.data);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const startEditExpense = (expense: Expense) => {
  setEditId(expense.id);
  setTitle(expense.title);
  setAmount(String(expense.amount));
  setCategory(expense.category);
  setOutletId(String(expense.outlet_id));
  setShowModal(true);
};

  const createExpense = async (e: React.FormEvent) => {
  e.preventDefault();

  const payload = {
    title,
    amount: Number(amount),
    category,
    outlet_id: Number(outletId),
  };

  if (editId) {
    await api.put(`/expenses/${editId}`, payload);
  } else {
    await api.post("/expenses/", payload);
  }

  setTitle("");
  setAmount("");
  setCategory("");
  setOutletId("");
  setEditId(null);
  setShowModal(false);

  fetchExpenses();
};

  const deleteExpense = async (id: number) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this expense?"
  );

  if (!confirmDelete) return;

  await api.delete(`/expenses/${id}`);
  fetchExpenses();
};
  


  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 bg-gray-100 p-8">
        <div className="flex justify-between items-center mb-6">
  <h1 className="text-3xl font-bold">Expenses</h1>

  <div className="flex gap-3">
    <button
      onClick={() => exportToCSV("expenses.csv", expenses)}
      className="bg-slate-900 text-white px-4 py-2 rounded-lg"
    >
      Export CSV
    </button>

    <button
      onClick={() => setShowModal(true)}
      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
    >
      Add Expense
    </button>
  </div>
</div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="p-4 text-left">ID</th>
                <th className="p-4 text-left">Title</th>
                <th className="p-4 text-left">Category</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-left">Outlet ID</th>
                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-b">
  <td className="p-4">{expense.id}</td>
  <td className="p-4">{expense.title}</td>
  <td className="p-4">{expense.category}</td>
  <td className="p-4 text-red-600 font-semibold">
    ₹{expense.amount}
  </td>
  <td className="p-4">{expense.outlet_id}</td>

  <td className="p-4">
    <button
  onClick={() => startEditExpense(expense)}
  className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
>
  Edit
</button>
    <button
      onClick={() => deleteExpense(expense.id)}
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
  {editId ? "Edit Expense" : "Add Expense"}
</h2>

              <form onSubmit={createExpense}>
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
                  placeholder="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
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
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
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

export default Expenses;