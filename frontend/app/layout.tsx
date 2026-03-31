 import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
    title: "Digital Book of India",
    description:
        "Digital Book of India is a comprehensive digital directory connecting local businesses with customers across India through interactive maps and detailed listings. Boost your online presence and discover local sellers effortlessly.",
    icons: {
        icon: '/favicon.ico',
        apple: '/assets/DLOGO.png',
    }
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
