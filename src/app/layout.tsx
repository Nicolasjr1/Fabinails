import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Fabi Nails — Estúdio de Unhas Premium | Manoel Ribas PR",
  description:
    "Alongamento, manutenção e banho de gel com acabamento ultra-fino e duradouro. Atendimento exclusivo, 2h dedicadas a você. Agende online.",
  openGraph: {
    title: "Fabi Nails — Beleza nas pontas dos dedos",
    description: "Unhas de assinatura com técnica editorial e cuidado premium.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="bg-[#fbf9f6] text-[#1a1716] antialiased">
        {children}
      </body>
    </html>
  );
}
