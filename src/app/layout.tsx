import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
 
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
 
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#16a34a" },
    { media: "(prefers-color-scheme: dark)", color: "#15803d" },
  ],
};
 
export const metadata: Metadata = {
  title: {
    template: "%s | EcoQuest",
    default: "EcoQuest — Track & Reduce Your Carbon Footprint",
  },
  description:
    "EcoQuest helps you understand, track, simulate, and reduce your carbon footprint through personalized insights, gamification, and AI-powered sustainability guidance.",
  keywords: [
    "carbon footprint",
    "sustainability",
    "climate change",
    "eco tracker",
    "green living",
    "CO2 calculator",
    "EcoQuest",
  ],
  authors: [{ name: "Kanishka Lodhi", url: "https://github.com/Kanishka780" }],
  creator: "Kanishka Lodhi",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "EcoQuest — Track & Reduce Your Carbon Footprint",
    description:
      "Understand, track, simulate, and reduce your carbon footprint with AI-powered insights.",
    siteName: "EcoQuest",
  },
  twitter: {
    card: "summary_large_image",
    title: "EcoQuest — Track & Reduce Your Carbon Footprint",
    description:
      "Understand, track, simulate, and reduce your carbon footprint with AI-powered insights.",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
};
 
interface RootLayoutProps {
  children: React.ReactNode;
}
 
/**
 * Root layout for EcoQuest.
 * Includes skip navigation link, ARIA landmark structure, font variables, and service worker registration.
 */
export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {/* Skip to main content — accessibility requirement */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-green-600 focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
        >
          Skip to main content
        </a>
 
        {/* Accessible landmark: banner (header navigation lives here via children) */}
        <div id="app-root" role="none">
          {children}
        </div>
 
        {/* Accessible live region for dynamic announcements */}
        <div
          id="aria-live-region"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />
 
        {/* Assertive region for critical alerts */}
        <div
          id="aria-alert-region"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          className="sr-only"
        />

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
