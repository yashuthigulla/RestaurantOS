import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

interface Outlet {
  id: number;
  name: string;
  location: string;
}

function Outlets() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [editId, setEditId] = useState<number | null>(null);

  const fetchOutlets = async () => {
    const response = await api.get("/outlets/");
    setOutlets(response.data);
  };

  useEffect(() => {
    fetchOutlets();
  }, []);

  const openAddModal = () => {
    setEditId(null);
    setName("");
    setLocation("");
    setShowModal(true);
  };

  const startEditOutlet = (outlet: Outlet) => {
    setEditId(outlet.id);
    setName(outlet.name);
    setLocation(outlet.location);
    setShowModal(true);
  };

  const saveOutlet = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editId) {
      await api.put(`/outlets/${editId}`, {
        name,
        location,
      });
    } else {
      await api.post("/outlets/", {
        name,
        location,
      });
    }

    setName("");
    setLocation("");
    setEditId(null);
    setShowModal(false);

    fetchOutlets();
  };

  const deleteOutlet = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this outlet?"
    );

    if (!confirmDelete) return;

    await api.delete(`/outlets/${id}`);
    fetchOutlets();
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="min-w-0 flex-1 bg-gray-100 p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Outlets</h1>

          <button
            onClick={openAddModal}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white sm:w-auto"
          >
            Add Outlet
          </button>
        </div>

        <div className="space-y-4 md:hidden">
          {outlets.map((outlet) => (
            <article key={outlet.id} className="rounded-xl bg-white p-4 shadow">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">Outlet #{outlet.id}</p>
                  <h2 className="truncate text-lg font-bold">{outlet.name}</h2>
                  <p className="mt-1 text-sm text-gray-600">{outlet.location}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => startEditOutlet(outlet)}
                  className="rounded bg-yellow-500 px-3 py-2 text-white"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteOutlet(outlet.id)}
                  className="rounded bg-red-600 px-3 py-2 text-white"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="hidden overflow-x-auto rounded-xl bg-white shadow md:block">
          <table className="w-full min-w-[680px]">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-4 text-left">ID</th>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Location</th>
                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {outlets.map((outlet) => (
                <tr key={outlet.id} className="border-b">
                  <td className="p-4">{outlet.id}</td>
                  <td className="p-4">{outlet.name}</td>
                  <td className="p-4">{outlet.location}</td>
                  <td className="p-4">
                    <button
                      onClick={() => startEditOutlet(outlet)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteOutlet(outlet.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
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
                {editId ? "Edit Outlet" : "Add Outlet"}
              </h2>

              <form onSubmit={saveOutlet}>
                <input
                  className="w-full border p-2 mb-3 rounded"
                  placeholder="Outlet Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <input
                  className="w-full border p-2 mb-3 rounded"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    className="rounded bg-blue-600 px-4 py-2 text-white"
                  >
                    {editId ? "Update" : "Save"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditId(null);
                    }}
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

export default Outlets;
