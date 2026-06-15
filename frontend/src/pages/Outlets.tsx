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

      <div className="flex-1 bg-gray-100 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Outlets</h1>

          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Add Outlet
          </button>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
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
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
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

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    {editId ? "Update" : "Save"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditId(null);
                    }}
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

export default Outlets;