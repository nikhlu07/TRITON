import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "@/components/triton/Navbar";
import Footer from "@/components/triton/Footer";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Audit from "@/pages/Audit";
import Compliance from "@/pages/Compliance";
import Docs from "@/pages/Docs";
import NotFound from "@/pages/NotFound";
import { WalletProvider } from "@/contexts/WalletContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WalletProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </WalletProvider>
  </QueryClientProvider>
);

export default App;
