import "./globals.css";
import { Poppins } from "next/font/google"; // import Poppins font

export const metadata = {
  title: "Uber Clone",
  description: "Ride-hailing demo (Next.js + Tailwind)",
};

// Initialize font with weights
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.className} bg-[#0b1a2e] text-white`}>
        <main className="w-screen min-h-screen flex flex-col">{children}</main>
      </body>
    </html>
  );
}
