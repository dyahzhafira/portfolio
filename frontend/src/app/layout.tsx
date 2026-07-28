import type { Metadata } from "next";
import {
  Libre_Caslon_Text,
  Montserrat,
  JetBrains_Mono,
  La_Belle_Aurore,
} from "next/font/google";
import "./globals.css";
import QueryProvider from "@/lib/query-provider";

const libreCaslonText = Libre_Caslon_Text({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const montserrat = Montserrat({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const laBelleAurore = La_Belle_Aurore({
  variable: "--font-handwritten",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Dyah - Software Engineer",
  description: "Personal portfolio of Dyah, a software engineer building full-stack systems.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${libreCaslonText.variable} ${montserrat.variable} ${jetbrainsMono.variable} ${laBelleAurore.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
