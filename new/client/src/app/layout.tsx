import { Metadata } from "next";
import 'bootstrap/dist/css/bootstrap.min.css';
import { getServerSession } from 'next-auth';
import SessionProvider from "../components/SessionProvider";
import NavMenu from "../components/NavMenu";

 
export const metadata: Metadata = {
  title: 'Stock Research Platform',
  description: 'Organize your investment thesis!',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          <main>
            <NavMenu />
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}
