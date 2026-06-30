import CustomerOrdersPanel from "@/components/CustomerOrdersPanel";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";

export default function OrdersPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-harvest-cream">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <h1 className="font-serif text-3xl font-bold text-harvest-green">My Orders</h1>
          <p className="mt-2 text-harvest-brown/80">
            View your past orders and pickup or delivery details — sign in, or look up a guest
            order with your email and order reference.
          </p>
          <div className="mt-8">
            <CustomerOrdersPanel />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}