import "@/styles/globals.css";
import type { AppProps } from "next/app";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { AlertsProvider } from "@/components/Alerts";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { SystemStatusGate } from "@/components/SystemStatusGate";

type AppPageProps = {
  session?: Session | null;
  [key: string]: unknown;
};

type ComponentPageProps = Omit<AppPageProps, "session">;

export default function App({ Component, pageProps }: AppProps<AppPageProps>) {
  const { session, ...pagePropsWithoutSession } = pageProps;
  const componentProps = pagePropsWithoutSession as ComponentPageProps;

  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <AuthProvider>
          <AlertsProvider>
            <SystemStatusGate>
              <Layout>
                <Component {...componentProps} />
              </Layout>
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: "#1F2937",
                    color: "#ffffff",
                    border: "2px solid #374151",
                    fontSize: "0.875rem"
                  },
                  duration: 5000
                }}
              />
            </SystemStatusGate>
          </AlertsProvider>
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
