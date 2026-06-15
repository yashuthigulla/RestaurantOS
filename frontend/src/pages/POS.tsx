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

interface CartItem {
  menu_item_id: number;
  name: string;
  price: number;
  quantity: number;
}

interface Bill {
  id: number;
  order_id: number;
  subtotal: number;
  discount: number;
  cgst: number;
  sgst: number;
  total_amount: number;
}

interface Order {
  id: number;
  total_amount: number;
  payment_method: string;
  status: string;
  outlet_id: number;
}

const getFoodImage = (category: string) => {
  const lower = category.toLowerCase();

  if (lower.includes("biryani")) {
    return "https://images.unsplash.com/photo-1563379091339-03246963d51a";
  }

  if (lower.includes("pizza")) {
    return "https://images.unsplash.com/photo-1513104890138-7c749659a591";
  }

  if (lower.includes("drink") || lower.includes("beverage")) {
    return "https://images.unsplash.com/photo-1544145945-f90425340c7e";
  }

  if (lower.includes("dessert")) {
    return "https://images.unsplash.com/photo-1551024506-0bccd828d307";
  }

  return "https://images.unsplash.com/photo-1504674900247-0877df9cc836";
};

function POS() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [outletId, setOutletId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [discount, setDiscount] = useState("");
  const [bill, setBill] = useState<Bill | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [todayOrders, setTodayOrders] = useState<Order[]>([]);

  const categories = [
    "All",
    ...new Set(menuItems.map((item) => item.category)),
  ];

  const fetchMenu = async () => {
    const response = await api.get("/menu/");
    setMenuItems(response.data);
  };

  const fetchTodayOrders = async () => {
    const response = await api.get("/orders/");
    setTodayOrders(response.data.slice(-5).reverse());
  };

  useEffect(() => {
    fetchMenu();
    fetchTodayOrders();
  }, []);

  const filteredMenu = menuItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find(
      (cartItem) => cartItem.menu_item_id === item.id
    );

    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.menu_item_id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([
        ...cart,
        {
          menu_item_id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
        },
      ]);
    }
  };

  const increaseQty = (id: number) => {
    setCart(
      cart.map((item) =>
        item.menu_item_id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQty = (id: number) => {
    setCart(
      cart
        .map((item) =>
          item.menu_item_id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const totalAmount = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const placeOrder = async () => {
    if (!outletId) {
      alert("Please enter Outlet ID");
      return;
    }

    if (cart.length === 0) {
      alert("Please add at least one item");
      return;
    }

    const orderResponse = await api.post("/orders/", {
      outlet_id: Number(outletId),
      payment_method: paymentMethod,
      items: cart.map((item) => ({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
      })),
    });

    const orderId = orderResponse.data.order_id;

    await api.put(`/orders/${orderId}/complete`);

    const billResponse = await api.post("/bills/generate", {
      order_id: orderId,
      discount: Number(discount || 0),
    });

    setBill(billResponse.data);
    setShowBillModal(true);
    fetchTodayOrders();

    setCart([]);
    setOutletId("");
    setPaymentMethod("UPI");
    setDiscount("");
  };

  const downloadBill = async () => {
    if (!bill) return;

    const response = await api.get(`/bills/${bill.id}/pdf`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");

    link.href = url;
    link.download = `bill_${bill.id}.pdf`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">
              POS Terminal
            </h1>
            <p className="text-slate-500 mt-1">
              Quick order billing with live cart and instant invoice.
            </p>
          </div>

          <div className="bg-white px-4 py-3 rounded-xl shadow-sm text-sm text-slate-600">
            Cashier Mode
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section className="xl:col-span-2">
            <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 border border-slate-100">
              <input
                className="w-full border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search biryani, pizza, tea..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex gap-3 mb-6 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                    selectedCategory === category
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-600 border border-slate-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMenu.map((item) => (
                <div
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="bg-white rounded-2xl border border-slate-200 p-4 cursor-pointer hover:shadow-lg hover:scale-105 transition"
                >
                  <img
                    src={getFoodImage(item.category)}
                    alt={item.name}
                    className="w-full h-28 object-cover rounded-xl mb-3"
                  />

                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">
                      {item.category}
                    </span>

                    <span className="text-green-600 font-bold">
                      ₹{item.price}
                    </span>
                  </div>

                  <h3 className="font-semibold text-lg mt-4">{item.name}</h3>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(item);
                    }}
                    className="w-full mt-4 bg-slate-900 text-white py-2 rounded-xl hover:bg-slate-800"
                  >
                    Add
                  </button>
                </div>
              ))}

              {filteredMenu.length === 0 && (
                <div className="col-span-full bg-white p-8 rounded-2xl text-center text-slate-500">
                  No menu items found.
                </div>
              )}
            </div>
          </section>

          <aside className="bg-white rounded-2xl shadow-sm p-6 h-fit sticky top-6 border border-slate-100">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold">Current Order</h2>
              <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                {cart.length} items
              </span>
            </div>

            <input
              className="w-full border p-3 rounded-lg mb-3"
              placeholder="Outlet ID"
              type="number"
              value={outletId}
              onChange={(e) => setOutletId(e.target.value)}
            />

            <select
              className="w-full border p-3 rounded-lg mb-3"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
            </select>

            <input
              className="w-full border p-3 rounded-lg mb-5"
              placeholder="Discount"
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {cart.map((item) => (
                <div
                  key={item.menu_item_id}
                  className="flex justify-between items-center border-b pb-3"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-slate-500">
                      ₹{item.price} × {item.quantity}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => decreaseQty(item.menu_item_id)}
                      className="bg-slate-200 w-7 h-7 rounded"
                    >
                      -
                    </button>

                    <span className="w-5 text-center">{item.quantity}</span>

                    <button
                      onClick={() => increaseQty(item.menu_item_id)}
                      className="bg-slate-200 w-7 h-7 rounded"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <p className="text-slate-500 text-center py-6">
                  No items added yet.
                </p>
              )}
            </div>

            <div className="mt-6 border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-green-600">₹{totalAmount}</span>
              </div>

              <button
                onClick={placeOrder}
                className="mt-5 w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 font-semibold"
              >
                Place Order & Generate Bill
              </button>
            </div>

            <div className="mt-6 border-t pt-4">
              <h3 className="font-bold mb-3">Today's Orders</h3>

              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                {todayOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex justify-between items-center bg-slate-50 p-3 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-sm text-slate-500">
                        {order.payment_method}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        ₹{order.total_amount}
                      </p>

                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}

                {todayOrders.length === 0 && (
                  <p className="text-slate-500 text-sm">No orders yet.</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {showBillModal && bill && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
            <h2 className="text-2xl font-bold mb-1 text-center">
              RestaurantOS
            </h2>
            <p className="text-center text-slate-500 mb-4">Tax Invoice</p>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Order ID</span>
                <span>#{bill.order_id}</span>
              </div>

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{bill.subtotal}</span>
              </div>

              <div className="flex justify-between">
                <span>Discount</span>
                <span>₹{bill.discount}</span>
              </div>

              <div className="flex justify-between">
                <span>CGST</span>
                <span>₹{bill.cgst}</span>
              </div>

              <div className="flex justify-between">
                <span>SGST</span>
                <span>₹{bill.sgst}</span>
              </div>

              <hr />

              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-green-600">₹{bill.total_amount}</span>
              </div>
            </div>

            <button
              onClick={() => setShowBillModal(false)}
              className="mt-6 w-full bg-slate-900 text-white py-2 rounded-lg"
            >
              Close
            </button>

            <button
              onClick={downloadBill}
              className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg"
            >
              Download / Print Bill
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default POS;