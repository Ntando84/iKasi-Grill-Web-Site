import type { Metadata } from "next";
import { CartProvider } from "@/lib/cart";
import "./globals.css";

export const metadata: Metadata = {
  title: "iKasi Grill — Shisa Nyama, Langa",
  description: "Order grilled meat, platters and sides from iKasi Grill in Langa, Cape Town.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
