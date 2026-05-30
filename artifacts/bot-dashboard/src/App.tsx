import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import DashboardLogin from "@/pages/dashboard-login";
import DashboardServers from "@/pages/dashboard-servers";
import DashboardServer from "@/pages/dashboard-server";
import DashboardGuard from "@/pages/dashboard-guard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/login" component={DashboardLogin} />
      <Route path="/">
        <DashboardGuard>
          <DashboardServers />
        </DashboardGuard>
      </Route>
      <Route path="/server/:guildId">
        {() => (
          <DashboardGuard>
            <DashboardServer />
          </DashboardGuard>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
