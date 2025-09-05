import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import { AuthProvider } from "@/features/auth";
import "./globals.css";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alem Pro | Простое управление вакансиями",
  description: "Alem Pro - это современное веб-приложение для управления вакансиями, которое упрощает процесс найма и помогает компаниям находить лучших кандидатов быстро и эффективно.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${rubik.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
