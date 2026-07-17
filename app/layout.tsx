import type { Metadata, Viewport } from "next";
import { Asap, Anton } from "next/font/google";
import "./globals.css";

/* Corpo de texto — Asap (fonte oficial do PT). */
const asap = Asap({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

/* Títulos / números — Anton, substituto livre da Prenton Cond Black
   (condensada, peso "black"). Trocar pela Prenton licenciada quando disponível. */
const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jerônimo Rodrigues · Painel de Campanha 2026",
  description:
    "Central de inteligência de mídia da pré-campanha de Jerônimo Rodrigues — dados de tráfego pago (Meta Ads) em tempo quase real.",
  applicationName: "Painel Jerônimo 2026",
  authors: [{ name: "CAP.CO" }],
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${asap.variable} ${anton.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
