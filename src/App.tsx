import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/home-page";
import ClientsPage from "./pages/clients-page";
import TicketsPage from "./pages/tickets-page";
import ProvidersPage from "./pages/providers-page";
import CategoriesPage from "./pages/categories-page";
import PurchasesPage from "./pages/purchases-page";
import SalesPage from "./pages/sales-page";
import PublicationsPage from "./pages/publications-page";
import ElementsPage from "./pages/elements-page";
import ProblemsPage from "./pages/problems-page";
import ServicesPage from "./pages/services-page";
import UsersPage from "./pages/users-page";
import ProductsPage from "./pages/products-page";
import MessagesPage from "./pages/messages-page";
import OperationsPage from "./pages/operations-page";
import LoginPage from "./pages/login-page";
import MessagingPage from "./pages/messaging-page";
import SalePDFPage from "./pages/sale-pdf-page";
import ImagesPage from "./pages/images-page";
import SeguimientosPage from "./pages/seguimientos-page";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/clientes" element={<ClientsPage />} />
        <Route path="/clientes/:id/elementos" element={<ElementsPage />} />
        <Route path="/clientes/:id/elementos/:elemento_id/seguimiento" element={<SeguimientosPage />} />
        <Route path="/usuarios" element={<UsersPage />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/tickets/:id/mensajes" element={<MessagesPage />} />
        <Route path="/tickets/:id/problemas" element={<ProblemsPage />} />
        <Route path="/tickets/:id/servicios" element={<ServicesPage />} />
        <Route path="/tickets/:id/servicios/:service_id/operaciones" element={<OperationsPage />} />
        <Route path="/productos" element={<ProductsPage />} />
        <Route path="/ventas" element={<SalesPage />} />
        <Route path="/ventas/:id/factura" element={<SalePDFPage />} />
        <Route path="/compras" element={<PurchasesPage />} />
        <Route path="/proveedores" element={<ProvidersPage />} />
        <Route path="/publicaciones" element={<PublicationsPage />} />
        <Route path="/categorias" element={<CategoriesPage />} />
        <Route path="/mensajeria" element={<MessagingPage />} />
        <Route path="/galeria" element={<ImagesPage />} />
        <Route path="/entrar" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}
