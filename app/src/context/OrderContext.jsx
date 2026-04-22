import { createContext, useContext, useReducer, useCallback } from 'react';

const OrderContext = createContext();

function orderReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.recipeId === action.payload.recipeId);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.recipeId === action.payload.recipeId ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((i) => i.recipeId !== action.payload),
      };
    case 'SET_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.recipeId !== action.payload.recipeId),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.recipeId === action.payload.recipeId ? { ...i, quantity: action.payload.quantity } : i
        ),
      };
    }
    case 'CLEAR':
      return { items: [], eventId: state.eventId };
    case 'SET_EVENT':
      return { ...state, eventId: action.payload };
    default:
      return state;
  }
}

export function OrderProvider({ children }) {
  const [state, dispatch] = useReducer(orderReducer, { items: [], eventId: null });

  const addItem = useCallback((recipeId, name) => {
    dispatch({ type: 'ADD_ITEM', payload: { recipeId, name } });
  }, []);

  const removeItem = useCallback((recipeId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: recipeId });
  }, []);

  const setQuantity = useCallback((recipeId, quantity) => {
    dispatch({ type: 'SET_QUANTITY', payload: { recipeId, quantity } });
  }, []);

  const clearOrder = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const setEventId = useCallback((eventId) => {
    dispatch({ type: 'SET_EVENT', payload: eventId });
  }, []);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const getItemQuantity = useCallback(
    (recipeId) => state.items.find((i) => i.recipeId === recipeId)?.quantity || 0,
    [state.items]
  );

  return (
    <OrderContext.Provider
      value={{
        items: state.items,
        eventId: state.eventId,
        totalItems,
        addItem,
        removeItem,
        setQuantity,
        clearOrder,
        setEventId,
        getItemQuantity,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrder must be used within OrderProvider');
  return ctx;
}
