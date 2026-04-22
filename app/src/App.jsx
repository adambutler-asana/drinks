import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { OrderProvider } from './context/OrderContext';
import { AdminProvider } from './context/AdminContext';
import AdminRoute from './components/AdminRoute';

import EventSelector from './views/EventSelector';
import Menu from './views/Menu';
import OrderConfirmation from './views/OrderConfirmation';
import GuestQueue from './views/GuestQueue';
import AdminPin from './views/AdminPin';
import AdminOrders from './views/AdminOrders';
import AdminArchive from './views/AdminArchive';
import AdminRecipes from './views/AdminRecipes';
import AdminRecipeDetail from './views/AdminRecipeDetail';
import AdminEvents from './views/AdminEvents';
import AdminEventDetail from './views/AdminEventDetail';

export default function App() {
  return (
    <BrowserRouter basename="/drinks">
      <AdminProvider>
        <OrderProvider>
          <Routes>
            {/* Guest routes */}
            <Route path="/" element={<EventSelector />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/event/:eventId" element={<Menu />} />
            <Route path="/order" element={<OrderConfirmation />} />
            <Route path="/queue" element={<GuestQueue />} />

            {/* Admin routes */}
            <Route path="/admin" element={<AdminPin />} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
            <Route path="/admin/archive" element={<AdminRoute><AdminArchive /></AdminRoute>} />
            <Route path="/admin/recipes" element={<AdminRoute><AdminRecipes /></AdminRoute>} />
            <Route path="/admin/recipes/:recipeId" element={<AdminRoute><AdminRecipeDetail /></AdminRoute>} />
            <Route path="/admin/events" element={<AdminRoute><AdminEvents /></AdminRoute>} />
            <Route path="/admin/events/:eventId" element={<AdminRoute><AdminEventDetail /></AdminRoute>} />
          </Routes>
        </OrderProvider>
      </AdminProvider>
    </BrowserRouter>
  );
}
