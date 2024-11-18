import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700","800"], // Choose the weights you want to include
});

export const metadata = {
  title:
    "Axara | From Tiny Sparks to Big Dreams - Inspiring Little Learners for Limitless Possibilities.",
  description:
    "Axara is an AI-powered educational platform for children aged 2-12, offering personalized stories, interactive learning, and fun explanations on any topic. Designed to fuel curiosity and learning through play, Axara adapts to each child's unique needs, helping them explore the world in an engaging, age-appropriate way.",
};

export default async function RootLayout({ children }) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale}>
      <body className={`${poppins.className} min-h-screen`}>
        <NextIntlClientProvider messages={messages}>
          <Toaster />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
