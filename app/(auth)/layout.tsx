import { playfair_display } from "../ui/fonts";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair_display.className} antialiased h-screen w-screen flex flex-col`}
      >
        <div className="grow">{children}</div>
      </body>
    </html>
  );
}
