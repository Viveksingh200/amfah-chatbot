import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AMFAH Expert Chatbot",
  description: "AI Air Quality & Humidity Expert Chatbot",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: 'resizes-visual',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full w-full antialiased`}
      style={{ margin: 0, padding: 0 }}
    >
      <body className="h-full w-full m-0 p-0 overflow-hidden flex flex-col">{children}</body>
    </html>
  );
}
