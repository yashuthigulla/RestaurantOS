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
    return "https://images.unsplash.com/photo-1631515242808-497c3fbd3972?auto=format&fit=crop&w=600&q=80";
  }

  if (lower.includes("rice")) {
    return "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80";
  }

  if (lower.includes("bread")) {
    return "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80";
  }

  if (lower.includes("curry")) {
    return "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80";
  }

  if (lower.includes("breakfast")) {
    return "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80";
  }

  if (lower.includes("beverage")) {
    return "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=600&q=80";
  }

  return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80";
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

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              POS Terminal
            </h1>
            <p className="text-slate-500 mt-1">
              Quick order billing with live cart and instant invoice.
            </p>
          </div>

          <div className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
            Cashier Mode
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="min-w-0">
            <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-200"
                placeholder="Search biryani, pizza, tea..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                      selectedCategory === category
                        ? "bg-slate-950 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {filteredMenu.map((item) => (
                <div
                  key={item.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
                >
                  <div className="relative">
                    <img
                      src={getFoodImage(item.category)}
                      alt={item.name}
                      className="h-32 w-full bg-slate-100 object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />

                    <span className="absolute left-2.5 top-2.5 max-w-[85%] truncate rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-sm">
                      {item.category}
                    </span>
                  </div>

                  <div className="p-3.5">
                    <h3 className="min-h-10 text-sm font-bold leading-snug text-slate-950">
                      {item.name}
                    </h3>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-base font-extrabold text-emerald-600">
                        &#8377;{item.price}
                      </span>

                      <button
                        type="button"
                        onClick={() => addToCart(item)}
                        className="rounded-lg bg-slate-950 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredMenu.length === 0 && (
                <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
                  No menu items found.
                </div>
              )}
            </div>
          </section>

          <aside className="h-fit space-y-5 xl:sticky xl:top-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/60">
              <div className="mb-4 flex items-center justify-between gap-3 border-b border-dashed border-slate-300 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-950">
                    Checkout Receipt
                  </h2>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    RestaurantOS counter bill
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                  {cart.length} items
                </span>
              </div>

              <div className="mb-4 grid grid-cols-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <div className="border-r border-slate-200 p-3 text-center">
                  <p className="text-[11px] font-bold uppercase text-slate-400">
                    Cart Items
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-slate-950">
                    {cart.length}
                  </p>
                </div>

                <div className="border-r border-slate-200 p-3 text-center">
                  <p className="text-[11px] font-bold uppercase text-slate-400">
                    Today's
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-slate-950">
                    {todayOrders.length}
                  </p>
                </div>

                <div className="p-3 text-center">
                  <p className="text-[11px] font-bold uppercase text-slate-400">
                    Cart Total
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-emerald-600">
                    &#8377;{totalAmount}
                  </p>
                </div>
              </div>

              <input
                className="mb-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
                placeholder="Outlet ID"
                type="number"
                value={outletId}
                onChange={(e) => setOutletId(e.target.value)}
              />

              <div className="max-h-[270px] space-y-2.5 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.menu_item_id}
                    className="rounded-xl border border-slate-100 bg-slate-50/80 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-bold leading-snug text-slate-950">
                          {item.name}
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-500">
                          &#8377;{item.price} &times; {item.quantity}
                        </p>
                      </div>

                      <p className="shrink-0 font-extrabold text-slate-950">
                        &#8377;{item.price * item.quantity}
                      </p>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => decreaseQty(item.menu_item_id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-base font-bold text-slate-700 transition hover:bg-slate-100"
                        >
                          -
                        </button>

                        <span className="w-7 text-center text-sm font-bold text-slate-900">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => increaseQty(item.menu_item_id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-base font-bold text-slate-700 transition hover:bg-slate-100"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {cart.length === 0 && (
                  <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-8 text-center text-sm font-medium text-slate-500">
                    No items added yet.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setCart([])}
                className="mt-3 w-full rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={cart.length === 0}
              >
                Clear Cart
              </button>

              <div className="mt-4">
                <p className="mb-2 text-sm font-bold text-slate-700">
                  Payment Method
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {["Cash", "UPI", "Card"].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-bold transition ${
                        paymentMethod === method
                          ? "border-slate-950 bg-slate-950 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <input
                className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
                placeholder="Discount"
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />

              <div className="mt-4 space-y-2.5 border-t border-dashed border-slate-300 pt-4">
                <div className="flex justify-between text-sm font-semibold text-slate-500">
                  <span>Subtotal</span>
                  <span>&#8377;{totalAmount}</span>
                </div>

                <div className="flex justify-between text-sm font-semibold text-slate-500">
                  <span>Discount</span>
                  <span>&#8377;{Number(discount || 0)}</span>
                </div>

                <div className="flex items-end justify-between text-xl font-extrabold text-slate-950">
                  <span>Total</span>
                  <span className="text-emerald-600">&#8377;{totalAmount}</span>
                </div>

                <button
                  onClick={placeOrder}
                  className="mt-2 w-full rounded-xl bg-emerald-600 py-3.5 text-base font-extrabold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  Place Order & Generate Bill
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-extrabold text-slate-950">
                  Today's Orders
                </h3>
                <span className="text-xs font-bold uppercase text-slate-400">
                  Last 5
                </span>
              </div>

              <div className="max-h-[260px] space-y-3 overflow-y-auto pr-1">
                {todayOrders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-950">
                          Order #{order.id}
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-500">
                          {order.payment_method}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-extrabold text-emerald-600">
                          &#8377;{order.total_amount}
                        </p>

                        <span
                          className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                            order.status === "completed"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {todayOrders.length === 0 && (
                  <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-6 text-center text-sm font-medium text-slate-500">
                    No orders yet.
                  </p>
                )}
              </div>
            </section>
          </aside>
        </div>
      </main>

      {showBillModal && bill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="border-b border-dashed border-slate-300 pb-5 text-center">
              <h2 className="text-2xl font-extrabold text-slate-950">
                RestaurantOS
              </h2>
              <p className="mt-1 text-sm font-semibold uppercase text-slate-400">
                Invoice / Receipt
              </p>
              <p className="mt-3 text-sm font-bold text-slate-700">
                Order ID #{bill.order_id}
              </p>
            </div>

            <div className="space-y-3 py-5 text-sm font-semibold text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-slate-950">&#8377;{bill.subtotal}</span>
              </div>

              <div className="flex justify-between">
                <span>Discount</span>
                <span className="text-slate-950">&#8377;{bill.discount}</span>
              </div>

              <div className="flex justify-between">
                <span>CGST</span>
                <span className="text-slate-950">&#8377;{bill.cgst}</span>
              </div>

              <div className="flex justify-between">
                <span>SGST</span>
                <span className="text-slate-950">&#8377;{bill.sgst}</span>
              </div>
            </div>

            <div className="border-y border-dashed border-slate-300 py-4">
              <div className="flex justify-between text-xl font-extrabold text-slate-950">
                <span>Grand Total</span>
                <span className="text-emerald-600">
                  &#8377;{bill.total_amount}
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowBillModal(false)}
                className="rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              >
                Close
              </button>

              <button
                onClick={downloadBill}
                className="rounded-xl bg-slate-950 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Download / Print Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default POS;
