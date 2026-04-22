import { NavLink, useLocation } from 'react-router-dom';
import { MenuIcon, QueueIcon, OrdersIcon, ArchiveIcon, RecipesIcon, EventsIcon } from './Icons';

export default function BottomNav({ type = 'guest' }) {
  const location = useLocation();
  const isMenuActive = ['/', '/menu'].includes(location.pathname) || location.pathname.startsWith('/event/');
  if (type === 'admin') {
    return (
      <nav className="bottom-nav">
        <NavLink to="/admin/orders">
          <span className="bottom-nav-icon"><OrdersIcon /></span>
          Orders
        </NavLink>
        <NavLink to="/admin/archive">
          <span className="bottom-nav-icon"><ArchiveIcon /></span>
          Archive
        </NavLink>
        <NavLink to="/admin/recipes">
          <span className="bottom-nav-icon"><RecipesIcon /></span>
          Recipes
        </NavLink>
        <NavLink to="/admin/events">
          <span className="bottom-nav-icon"><EventsIcon /></span>
          Events
        </NavLink>
      </nav>
    );
  }

  return (
    <nav className="bottom-nav">
      <NavLink to="/" end className={({ isActive }) => (isActive || isMenuActive) ? 'active' : ''}>
        <span className="bottom-nav-icon"><MenuIcon /></span>
        Menu
      </NavLink>
      <NavLink to="/queue">
        <span className="bottom-nav-icon"><QueueIcon /></span>
        Queue
      </NavLink>
    </nav>
  );
}
