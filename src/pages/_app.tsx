import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import { AlertsProvider } from "@/components/Alerts";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AlertsProvider>
      <Component {...pageProps} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1F2937", // bg-gray-800
            color: "#ffffff",
            border: "2px solid #374151", // border-gray-700
            fontSize: "0.875rem"
          },
          duration: 5000
        }}
      />
    </AlertsProvider>
  );
}
