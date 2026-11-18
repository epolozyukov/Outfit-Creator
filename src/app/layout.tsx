import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const barlow = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Outfit Creator – Build your perfect look",
  description:
    "Pick your activity, weather and style and get a complete sportswear outfit in seconds. Workshop concept.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${barlow.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <header className="border-b border-line">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <span className="font-heading text-2xl font-extrabold uppercase tracking-wider">
              Outfit Creator
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-muted">
              Workshop concept
            </span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
          {children}
        </main>
        <footer className="border-t border-line bg-surface">
          <p className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted sm:px-6">
            Workshop concept – not an official Adidas product. Prices are
            illustrative.
          </p>
        </footer>
      </body>
    </html>
  );
}
