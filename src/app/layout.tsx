import type { Metadata } from "next";
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

import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  userScalable: true
};

export const metadata: Metadata = {
  title: "EcoQuest | Carbon Footprint Tracker & Gamified Reduction Platform",
  description: "Calculate, analyze, and reduce your carbon footprint with our gamified platform. Features interactive calculators, carbon hotspots, simulated savings, and AI coaching.",
  keywords: "sustainability, carbon footprint, CO2 calculator, climate change, eco challenge, green commute",
  authors: [{ name: "EcoQuest Team" }],
  manifest: "/manifest.json"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} h-full antialiased font-sans bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-200`}>
        {children}
        {process.env.NODE_ENV === 'production' ? (
          <script dangerouslySetInnerHTML={{__html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(reg) {
                  console.log('Service Worker registered successfully:', reg.scope);
                }).catch(function(err) {
                  console.error('Service Worker registration failed:', err);
                });
              });
            }
          `}} />
        ) : (
          <script dangerouslySetInnerHTML={{__html: `
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for (let registration of registrations) {
                  registration.unregister().then(function() {
                    console.log('Dev Mode: Service Worker unregistered.');
                  });
                }
              });
            }
            if ('caches' in window) {
              caches.keys().then(function(names) {
                for (let name of names) {
                  caches.delete(name).then(function() {
                    console.log('Dev Mode: Cache cleared:', name);
                  });
                }
              });
            }
          `}} />
        )}
      </body>
    </html>
  );
}
