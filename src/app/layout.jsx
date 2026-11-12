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
      <body>{children}</body>
    </html>
  );
}
