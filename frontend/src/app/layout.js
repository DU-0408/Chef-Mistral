import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata = {
  title: "Chef Qwen — Your AI Chef Companion",
  description:
    "Enter your ingredients and let AI craft the perfect recipe for you. Powered by Qwen AI.",
  keywords: ["recipe", "AI", "cooking", "ingredients", "Qwen"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-background min-h-screen flex flex-col antialiased selection:bg-primary-container selection:text-on-primary-container">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
