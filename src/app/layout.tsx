import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  Cormorant_Garamond,
  Figtree,
  Fraunces,
  Newsreader,
  Source_Sans_3,
  Syne,
} from "next/font/google";
import { Masthead } from "@/components/Masthead";
import { StudioFooter } from "@/components/StudioFooter";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  style: ["normal", "italic"],
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nave & Spire — Visual & UX comparison of two Singapore parish sites",
  description:
    "An evidence-backed design audit comparing Church of the Blessed Sacrament and Church of Our Lady of Lourdes: type, colour, layout, motion, accessibility, and information architecture.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${newsreader.variable} ${figtree.variable} ${fraunces.variable} ${cormorant.variable} ${sourceSans.variable}`}
    >
      <body className="bg-paper text-ink antialiased">
        <a
          href="#main"
          className="font-sans sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          Skip to content
        </a>
        <Masthead />
        {children}
        <StudioFooter />
      </body>
    </html>
  );
}
