import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  outlet_id: number;
}

function Menu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [outletId, setOutletId] = useState("");

  const fetchMenu = async () => {
    const response = await api.get("/menu/");
    setMenuItems(response.data);
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const createMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();

    await api.post("/menu/", {
      name,
      price: Number(price),
      category,
      outlet_id: Number(outletId),
    });

    setName("");
    setPrice("");
    setCategory("");
    setOutletId("");
    setShowModal(false);

    fetchMenu();
  };

  const deleteMenuItem = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this menu item?"
    );

    if (!confirmDelete) return;

    await api.delete(`/menu/${id}`);
    fetchMenu();
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="min-w-0 flex-1 bg-slate-100 p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Menu</h1>
            <p className="text-slate-500 mt-1">
              Manage food items, pricing, and categories.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 sm:w-auto"
          >
            Add Menu Item
          </button>
        </div>

        <div className="space-y-4 md:hidden">
          {menuItems.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-slate-500">Item #{item.id}</p>
                  <h2 className="truncate text-lg font-bold text-slate-900">
                    {item.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.category} - Outlet {item.outlet_id}
                  </p>
                </div>

                <p className="shrink-0 font-semibold text-green-600">
                  &#8377;{item.price}
                </p>
              </div>

              <button
                onClick={() => deleteMenuItem(item.id)}
                className="w-full rounded bg-red-600 px-3 py-2 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </article>
          ))}

          {menuItems.length === 0 && (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center text-slate-500 shadow-sm">
              No menu items found.
            </div>
          )}
        </div>

        <div className="hidden overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm md:block">
          <table className="w-full min-w-[760px]">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="p-4 text-left">ID</th>
                <th className="p-4 text-left">Item</th>
                <th className="p-4 text-left">Category</th>
                <th className="p-4 text-left">Price</th>
                <th className="p-4 text-left">Outlet ID</th>
                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {menuItems.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-4">{item.id}</td>
                  <td className="p-4 font-medium">{item.name}</td>
                  <td className="p-4">{item.category}</td>
                  <td className="p-4 text-green-600 font-semibold">
                    ₹{item.price}
                  </td>
                  <td className="p-4">{item.outlet_id}</td>
                  <td className="p-4">
                    <button
                      onClick={() => deleteMenuItem(item.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {menuItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    No menu items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Add Menu Item</h2>

              <form onSubmit={createMenuItem}>
                <input
                  className="w-full border p-2 mb-3 rounded"
                  placeholder="Item Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <input
                  className="w-full border p-2 mb-3 rounded"
                  placeholder="Price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
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
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
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

export default Menu;
