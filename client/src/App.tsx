/* MARGIN / Quiet Instrument: the app keeps one calm, recovery-first instrument surface and uses the page-level screen state for navigation. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

export default function App() {
  const path = window.location.pathname;
  const Page = path === "/terms" ? Terms : path === "/privacy" ? Privacy : Home;
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Page />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
