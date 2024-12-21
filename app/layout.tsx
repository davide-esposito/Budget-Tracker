import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import RootProviders from "@/components/providers/RootProviders";
import { Toaster } from "sonner";

export const metadata = {
  title: "Budget Tracker - Manage Your Finances",
  description: "A simple and efficient app to help you track your budget and expenses effortlessly.",
  openGraph: {
    title: "Budget Tracker - Your Finance Manager",
    description: "Take control of your finances with our intuitive budget tracker app.",
    url: "https://budget-tracker-wheat-phi.vercel.app/",
    siteName: "Budget Tracker",
    images: [
      {
        url: "https://budget-tracker-wheat-phi.vercel.app/favicon.ico",
        width: 256,
        height: 256,
        alt: "Budget Tracker favicon",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl={
        process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL
      }
      signUpFallbackRedirectUrl={
        process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL
      }
    >
      <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
        <head>
          {/* Basic Metadata */}
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="description" content={metadata.description} />
          <title>{metadata.title}</title>

          {/* Favicon */}
          <link rel="icon" href="/favicon.ico" type="image/x-icon" />

          {/* Open Graph Metadata */}
          <meta property="og:title" content={metadata.openGraph.title} />
          <meta property="og:description" content={metadata.openGraph.description} />
          <meta property="og:url" content={metadata.openGraph.url} />
          <meta property="og:site_name" content={metadata.openGraph.siteName} />
          <meta property="og:type" content={metadata.openGraph.type} />
          {metadata.openGraph.images.map((image, index) => (
            <meta key={index} property="og:image" content={image.url} />
          ))}
          {metadata.openGraph.images.map((image, index) => (
            <meta key={index} property="og:image:alt" content={image.alt} />
          ))}
        </head>
        <body className="antialiased">
          <Toaster richColors position="bottom-right" />
          <RootProviders>{children}</RootProviders>
        </body>
      </html>
    </ClerkProvider>
  );
}
