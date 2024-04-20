import "./globals.css";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import SessionProvider from "../components/SessionProvider";
import NavMenu from "../components/NavMenu";
import Footer from "../components/Footer";
import { authOptions } from "../lib/nextAuthOptions";

export const metadata: Metadata = {
  title: "Stock Research Platform",
  description: "Organize your investment thesis!",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" data-theme="light">
      <body className="flex flex-col h-screen">
        <SessionProvider session={session}>
          <NavMenu />
          <main className="mt-5 mb-auto">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
