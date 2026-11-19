import Script from "next/script";
import { MuseoModerno, Poppins } from "next/font/google";
import "./globals.css";

const museo = MuseoModerno({ subsets: ["latin"], variable: "--font-museo" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "NobNob",
  description: "Ruang kerja konten TikTok untuk UMKM.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${museo.variable} ${poppins.variable}`}>
      <body>
        <Script id="post-navigation-guard" strategy="beforeInteractive">
          {`window.addEventListener("popstate", function(event) {
            window.__nobnobPostHistoryGuard?.(event);
          }, true);`}
        </Script>
        {children}
      </body>
    </html>
  );
}
