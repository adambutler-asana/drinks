import { useNavigate } from 'react-router-dom';
import { useOrder } from '../context/OrderContext';

export default function OrderBar() {
  const { totalItems } = useOrder();
  const navigate = useNavigate();

  if (totalItems === 0) return null;

  return (
    <div className="order-bar">
      <span className="order-bar-count">
        {totalItems} drink{totalItems !== 1 ? 's' : ''}
      </span>
      <button className="order-bar-btn" onClick={() => navigate('/order')}>
        Add to Order
      </button>
    </div>
  );
}
