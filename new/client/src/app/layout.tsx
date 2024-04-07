import { Metadata } from "next";

 
export const metadata: Metadata = {
  title: 'Stock Research Platform',
  description: 'Organize your investment thesis!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
