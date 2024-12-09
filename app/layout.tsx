import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import RootProviders from "@/components/providers/RootProviders";
import { Toaster } from "sonner";

export const metadata = {
  title: "Budget Tracker",
  description: "Easily track your budget and expenses with this app.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider afterSignOutUrl="/sign-in">
      <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
        <body className="antialiased">
          <Toaster richColors position="bottom-right" />
          <RootProviders>{children}</RootProviders>
        </body>
      </html>
    </ClerkProvider>
  );
}
