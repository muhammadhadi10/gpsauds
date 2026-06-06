import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | GPSA-UDS",
    default: "GPSA-UDS — Ghana Pharmaceutical Students Association",
  },
  description:
    "Ghana Pharmaceutical Students Association, University for Development Studies — empowering pharmacy students through leadership, welfare, and academic excellence.",
  keywords: [
    "GPSA",
    "UDS",
    "Ghana Pharmaceutical Students Association",
    "pharmacy students",
    "UDS Tamale",
  ],
  openGraph: {
    title: "GPSA-UDS",
    description:
      "Ghana Pharmaceutical Students Association — University for Development Studies",
    type: "website",
    locale: "en_GH",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${dmSans.variable} font-[var(--font-dm-sans)] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
