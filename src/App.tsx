import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/home-page";
import ClientsPage from "./pages/clients-page";
import TicketsPage from "./pages/tickets-page";
import ProvidersPage from "./pages/providers-page";
import CategoriesPage from "./pages/categories-page";
import PurchasesPage from "./pages/purchases-page";
import SalesPage from "./pages/sales-page";
import PublicationsPage from "./pages/publications-page";
import UsersPage from "./pages/users-page";
import ProductsPage from "./pages/products-page";
import LoginPage from "./pages/login-page";
import MessagingPage from "./pages/messaging-page";
import SalePDFPage from "./pages/sale-pdf-page";
import ImagesPage from "./pages/images-page";
import RequestPasswordResetPage from "./pages/request-password-reset-page";
import PasswordResetPage from "./pages/password-reset";
import MessagesPage from "./pages/messages-page";
import ImpuestoPage from "./pages/impuestos-page";
import RolesPage from "./pages/roles-page";
import HistoricoPage from "./pages/historico-pages";
import AccesoPage from "./pages/acceso-page";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/clientes" element={<ClientsPage />} />
        <Route path="/usuarios" element={<UsersPage />} />
        <Route path="/usuarios/:id/actividad" element={<AccesoPage />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/tickets/:id/mensajes" element={<MessagesPage />} />
        <Route path="/productos" element={<ProductsPage />} />
        <Route path="/ventas" element={<SalesPage />} />
        <Route path="/ventas/:id/factura" element={<SalePDFPage />} />
        <Route path="/compras" element={<PurchasesPage />} />
        <Route path="/proveedores" element={<ProvidersPage />} />
        <Route path="/publicaciones" element={<PublicationsPage />} />
        <Route path="/categorias" element={<CategoriesPage />} />
        <Route path="/impuestos" element={<ImpuestoPage />} />
        <Route path="/mensajeria" element={<MessagingPage />} />
        <Route path="/galeria" element={<ImagesPage />} />
        <Route path="/roles" element={<RolesPage />} />
        <Route path="/entrar" element={<LoginPage />} />
        <Route path="/historico" element={<HistoricoPage />} />
        <Route
          path="/solicitar-restablecimiento-contraseña"
          element={<RequestPasswordResetPage />}
        />
        <Route path="/restablecer-contraseña" element={<PasswordResetPage />} />
      </Routes>
    </BrowserRouter>
  );
}
