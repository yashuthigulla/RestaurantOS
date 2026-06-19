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

      <div className="min-w-0 flex-1 bg-gray-100 p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <h1 className="text-3xl font-bold">Expenses</h1>

  <div className="flex flex-col gap-3 sm:flex-row">
    <button
      onClick={() => exportToCSV("expenses.csv", expenses)}
      className="rounded-lg bg-slate-900 px-4 py-2 text-white"
    >
      Export CSV
    </button>

    <button
      onClick={() => setShowModal(true)}
      className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
    >
      Add Expense
    </button>
  </div>
</div>

        <div className="space-y-4 md:hidden">
          {expenses.map((expense) => (
            <article key={expense.id} className="rounded-xl bg-white p-4 shadow">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">Expense #{expense.id}</p>
                  <h2 className="truncate text-lg font-bold">{expense.title}</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    {expense.category} - Outlet {expense.outlet_id}
                  </p>
                </div>

                <p className="shrink-0 font-semibold text-red-600">
                  &#8377;{expense.amount}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => startEditExpense(expense)}
                  className="rounded bg-yellow-500 px-3 py-2 text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteExpense(expense.id)}
                  className="rounded bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="hidden overflow-x-auto rounded-xl bg-white shadow md:block">
          <table className="w-full min-w-[820px]">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
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

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
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

export default Expenses;
