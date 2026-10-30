
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/toast/ToastProvider";
import StoreProvider from "@/redux/storeProvider/StoreProvider";
import SocketInitializer from "../components/Socket/SocketInitializer"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Dateish",
  description: "Dateish is a modern, user-friendly dating web application designed to help people connect, discover meaningful relationships, and meet new people online. With a clean interface, attractive design, and smooth user experience, Dateish makes online dating simple, fun, and engaging. Users can create personalized profiles, upload photos, explore potential matches, like profiles, and chat with people who share similar interests. The platform focuses on helping users build genuine connections through an intuitive matching system, real-time messaging, and privacy-focused features.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <StoreProvider>
      <SocketInitializer />
        {children}
<ToastProvider />
        </StoreProvider>
      </body>
    </html>
  );
}




