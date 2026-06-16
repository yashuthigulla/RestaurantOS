import { useEffect, useMemo, useState } from "react";
import { Download, FileDown, Search } from "lucide-react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { exportToCSV } from "../utils/exportCSV";

interface Bill {
  id: number;
  order_id: number;
  subtotal: number;
  discount: number;
  cgst: number;
  sgst: number;
  total_amount: number;
  created_at: string;
  payment_method: string;
  outlet_id: number;
}

function Bills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchBills = async () => {
    setIsLoading(true);
    const response = await api.get("/bills/");
    setBills(response.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const filteredBills = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return bills;

    return bills.filter((bill) =>
      [
        bill.id,
        bill.order_id,
        bill.outlet_id,
        bill.payment_method,
        bill.total_amount,
        bill.created_at,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [bills, search]);

  const downloadBill = async (id: number) => {
    const response = await api.get(`/bills/${id}/pdf`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");

    link.href = url;
    link.download = `bill_${id}.pdf`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  };

  const exportBills = () => {
    exportToCSV(
      "bills.csv",
      filteredBills.map((bill) => ({
        id: bill.id,
        order_id: bill.order_id,
        outlet_id: bill.outlet_id,
        payment_method: bill.payment_method,
        subtotal: bill.subtotal,
        discount: bill.discount,
        cgst: bill.cgst,
        sgst: bill.sgst,
        total_amount: bill.total_amount,
        created_at: bill.created_at,
      })),
    );
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="min-w-0 flex-1 bg-slate-100 p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Bills</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500 sm:text-base">
              View generated invoices, search billing history, and re-download PDFs.
            </p>
          </div>

          <button
            onClick={exportBills}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 sm:w-auto"
          >
            <FileDown size={18} />
            Export CSV
          </button>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
            <Search size={18} className="text-slate-400" />
            <input
              className="w-full py-3 outline-none"
              placeholder="Search bills"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>

        <div className="space-y-4 md:hidden">
          {filteredBills.map((bill) => (
            <article key={bill.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">Bill #{bill.id}</p>
                  <h2 className="text-lg font-bold text-slate-900">
                    Rs. {Number(bill.total_amount).toFixed(2)}
                  </h2>
                </div>

                <button
                  onClick={() => downloadBill(bill.id)}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <Download size={16} />
                  PDF
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500">Order</p>
                  <p className="font-medium">#{bill.order_id}</p>
                </div>
                <div>
                  <p className="text-slate-500">Outlet</p>
                  <p className="font-medium">{bill.outlet_id}</p>
                </div>
                <div>
                  <p className="text-slate-500">Payment</p>
                  <p className="font-medium">{bill.payment_method || "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Tax</p>
                  <p className="font-medium">Rs. {Number(bill.cgst + bill.sgst).toFixed(2)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-500">Created</p>
                  <p className="font-medium">{new Date(bill.created_at).toLocaleString()}</p>
                </div>
              </div>
            </article>
          ))}

          {!isLoading && filteredBills.length === 0 && (
            <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">
              No bills found.
            </div>
          )}

          {isLoading && (
            <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">
              Loading bills...
            </div>
          )}
        </div>

        <div className="hidden overflow-x-auto rounded-2xl bg-white shadow-sm md:block">
          <table className="min-w-[960px] w-full">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="p-4 text-left">Bill ID</th>
                <th className="p-4 text-left">Order ID</th>
                <th className="p-4 text-left">Outlet ID</th>
                <th className="p-4 text-left">Payment</th>
                <th className="p-4 text-left">Subtotal</th>
                <th className="p-4 text-left">Tax</th>
                <th className="p-4 text-left">Total</th>
                <th className="p-4 text-left">Created</th>
                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredBills.map((bill) => (
                <tr key={bill.id} className="border-b last:border-b-0">
                  <td className="p-4 font-medium">#{bill.id}</td>
                  <td className="p-4">#{bill.order_id}</td>
                  <td className="p-4">{bill.outlet_id}</td>
                  <td className="p-4">{bill.payment_method || "N/A"}</td>
                  <td className="p-4">Rs. {bill.subtotal}</td>
                  <td className="p-4">Rs. {Number(bill.cgst + bill.sgst).toFixed(2)}</td>
                  <td className="p-4 font-semibold text-green-600">
                    Rs. {Number(bill.total_amount).toFixed(2)}
                  </td>
                  <td className="p-4 text-sm text-slate-500">
                    {new Date(bill.created_at).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => downloadBill(bill.id)}
                      className="inline-flex items-center gap-2 rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      <Download size={16} />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}

              {!isLoading && filteredBills.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    No bills found.
                  </td>
                </tr>
              )}

              {isLoading && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    Loading bills...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Bills;
