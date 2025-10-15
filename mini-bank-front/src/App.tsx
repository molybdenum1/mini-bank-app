import "./styles/base.css";
import "./styles/components.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "./auth/useAuth";
import Dashboard from "./pages/Dashboard";
import TransferPage from "./pages/TransferPage";
import ExchangePage from "./pages/ExchangePage";
import TransactionsPage from "./pages/TransactionsPage";
import { AuthProvider } from "./auth/AuthContext";
import { RequireAuth } from "./auth/useAuth";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function AppWrapper() {
  const loc = useLocation();
  const hideNav = loc.pathname === "/login" || loc.pathname === "/register";
  return (
    <div style={{ maxWidth: 980, margin: "18px auto", padding: 12 }}>
      {!hideNav && (
        <nav style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <Link to="/">Dashboard</Link>
          <Link to="/transfer">Transfer</Link>
          <Link to="/exchange">Exchange</Link>
          <Link to="/transactions">Transactions</Link>
          <AuthLogout />
        </nav>
      )}
      <Routes>
        <Route
          path="/"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/transfer"
          element={
            <RequireAuth>
              <TransferPage />
            </RequireAuth>
          }
        />
        <Route
          path="/exchange"
          element={
            <RequireAuth>
              <ExchangePage />
            </RequireAuth>
          }
        />
        <Route
          path="/transactions"
          element={
            <RequireAuth>
              <TransactionsPage />
            </RequireAuth>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="*"
          element={<div style={{ padding: 24 }}>Not Found</div>}
        />
      </Routes>
    </div>
  );
}

function AuthLogout() {
  const auth = useAuth();
  const nav = useNavigate();
  function handle() {
    auth.logout();
    nav("/login");
  }
  return (
    <button onClick={handle} style={{ marginLeft: "auto" }}>
      Logout
    </button>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppWrapper />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
