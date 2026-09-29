import type { Metadata } from "next";
import {
  Inter,
  Roboto,
  Lato,
  Source_Sans_3,
  Merriweather,
  Poppins,
  Playfair_Display,
  IBM_Plex_Sans,
} from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});
const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
});
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source",
});
const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-merriweather",
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-playfair",
});
const ibmPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex",
});

export const metadata: Metadata = {
  title: "Resumé — Build a standout resume",
  description:
    "A fast, modern resume builder. Pick a template, edit with live preview, and export to PDF.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${inter.variable} ${roboto.variable} ${lato.variable} ${sourceSans.variable} ${merriweather.variable} ${poppins.variable} ${playfair.variable} ${ibmPlex.variable} min-h-full antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
