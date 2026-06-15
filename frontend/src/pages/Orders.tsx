import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { exportToCSV } from "../utils/exportCSV";

interface Order {
  id: number;
  total_amount: number;
  payment_method: string;
  status: string;
  outlet_id: number;
}

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  outlet_id: number;
}

interface SelectedItem {
  menu_item_id: number;
  quantity: number;
}

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [outletId, setOutletId] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("");
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [showItemsModal, setShowItemsModal] = useState(false);

  const fetchOrders = async () => {
    const response = await api.get("/orders/");
    setOrders(response.data);
  };

  const fetchMenuItems = async () => {
    const response = await api.get("/menu/");
    setMenuItems(response.data);
  };

  const viewOrderItems = async (id: number) => {
    const response = await api.get(`/orders/${id}/items`);

    setOrderItems(response.data);
    setShowItemsModal(true);
  };

  useEffect(() => {
    fetchOrders();
    fetchMenuItems();
  }, []);

  const addItemRow = () => {
    setSelectedItems([
      ...selectedItems,
      {
        menu_item_id: 0,
        quantity: 1,
      },
    ]);
  };

  const updateItem = (
    index: number,
    field: keyof SelectedItem,
    value: number,
  ) => {
    const updatedItems = [...selectedItems];
    updatedItems[index][field] = value;
    setSelectedItems(updatedItems);
  };

  const removeItemRow = (index: number) => {
    const updatedItems = selectedItems.filter((_, i) => i !== index);
    setSelectedItems(updatedItems);
  };

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => {
      const menuItem = menuItems.find((menu) => menu.id === item.menu_item_id);

      if (!menuItem) return total;

      return total + menuItem.price * item.quantity;
    }, 0);
  };

  const createOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    await api.post("/orders/", {
      outlet_id: Number(outletId),
      payment_method: paymentMethod,
      items: selectedItems,
    });

    setOutletId("");
    setPaymentMethod("");
    setSelectedItems([]);
    setShowModal(false);

    fetchOrders();
  };

  const completeOrder = async (id: number) => {
    await api.put(`/orders/${id}/complete`);
    fetchOrders();
  };

  const deleteOrder = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this order?",
    );

    if (!confirmDelete) return;

    await api.delete(`/orders/${id}`);
    fetchOrders();
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 bg-slate-100 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
            <p className="text-slate-500 mt-1">
              Create orders, complete them, and auto-generate revenue.
            </p>
          </div>

           <div className="flex gap-3">

          <button
            onClick={() => exportToCSV("orders.csv", orders)}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg"
          >
            Export CSV
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Order
          </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="p-4 text-left">ID</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-left">Payment</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Outlet ID</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b">
                  <td className="p-4">{order.id}</td>

                  <td className="p-4 font-semibold text-green-600">
                    ₹{order.total_amount}
                  </td>

                  <td className="p-4">{order.payment_method}</td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td className="p-4">{order.outlet_id}</td>

                  <td className="p-4 flex gap-2">
                    {order.status !== "completed" && (
                      <button
                        onClick={() => completeOrder(order.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Complete
                      </button>
                    )}

                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>

                    <button
                      onClick={() => viewOrderItems(order.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl w-[600px] shadow-lg">
              <h2 className="text-xl font-bold mb-4">Create Order</h2>

              <form onSubmit={createOrder}>
                <input
                  className="w-full border p-2 mb-3 rounded"
                  placeholder="Outlet ID"
                  type="number"
                  value={outletId}
                  onChange={(e) => setOutletId(e.target.value)}
                  required
                />

                <select
                  className="w-full border p-2 mb-3 rounded"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                >
                  <option value="">Select Payment Method</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                </select>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold">Order Items</h3>

                    <button
                      type="button"
                      onClick={addItemRow}
                      className="bg-slate-900 text-white px-3 py-1 rounded"
                    >
                      Add Item
                    </button>
                  </div>

                  {selectedItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 mb-3">
                      <select
                        className="col-span-7 border p-2 rounded"
                        value={item.menu_item_id}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "menu_item_id",
                            Number(e.target.value),
                          )
                        }
                        required
                      >
                        <option value={0}>Select Item</option>

                        {menuItems.map((menu) => (
                          <option key={menu.id} value={menu.id}>
                            {menu.name} - ₹{menu.price}
                          </option>
                        ))}
                      </select>

                      <input
                        className="col-span-3 border p-2 rounded"
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, "quantity", Number(e.target.value))
                        }
                      />

                      <button
                        type="button"
                        onClick={() => removeItemRow(index)}
                        className="col-span-2 bg-red-600 text-white rounded"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-100 p-4 rounded-lg mb-4">
                  <p className="text-slate-500">Estimated Total</p>
                  <h3 className="text-2xl font-bold text-green-600">
                    ₹{calculateTotal()}
                  </h3>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Save Order
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedItems([]);
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
        {showItemsModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl w-[600px] shadow-lg">
              <h2 className="text-xl font-bold mb-4">Order Items</h2>

              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Item</th>
                    <th className="text-left p-2">Price</th>
                    <th className="text-left p-2">Qty</th>
                    <th className="text-left p-2">Subtotal</th>
                  </tr>
                </thead>

                <tbody>
                  {orderItems.map((item) => (
                    <tr key={item.id}>
                      <td className="p-2">{item.name}</td>
                      <td className="p-2">₹{item.price}</td>
                      <td className="p-2">{item.quantity}</td>
                      <td className="p-2 font-semibold text-green-600">
                        ₹{item.subtotal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-6">
                <button
                  onClick={() => setShowItemsModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
