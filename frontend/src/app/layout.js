import "./globals.css";
import { AuthProvider } from "@/lib/auth";

export const metadata = {
  title: "Chef Qwen — Your AI Chef Companion",
  description:
    "Enter your ingredients and let AI craft the perfect recipe for you. Powered by Qwen AI.",
  keywords: ["recipe", "AI", "cooking", "ingredients", "Mistral"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
