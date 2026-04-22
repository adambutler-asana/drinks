import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { subscribeRecipes, getEvent } from '../services/firebase';
import { useOrder } from '../context/OrderContext';
import { CATEGORIES } from '../services/seedData';
import DrinkCard from '../components/DrinkCard';
import OrderBar from '../components/OrderBar';
import BottomNav from '../components/BottomNav';

export default function Menu() {
  const { eventId } = useParams();
  const [recipes, setRecipes] = useState(null);
  const [event, setEvent] = useState(null);
  const [availableIds, setAvailableIds] = useState(null);
  const { setEventId, totalItems } = useOrder();

  useEffect(() => {
    setEventId(eventId || null);
  }, [eventId, setEventId]);

  useEffect(() => {
    if (eventId) {
      getEvent(eventId).then((evt) => {
        setEvent(evt);
        setAvailableIds(evt?.availableDrinks || []);
      });
    }
  }, [eventId]);

  useEffect(() => {
    return subscribeRecipes(setRecipes);
  }, []);

  if (!recipes) return <div className="loading">Loading...</div>;

  const filtered = availableIds
    ? recipes.filter((r) => availableIds.includes(r.id))
    : recipes;

  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    drinks: filtered
      .filter((r) => r.category === cat)
      .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999)),
  })).filter((g) => g.drinks.length > 0);

  return (
    <div className={`page ${totalItems > 0 ? 'page-with-bar' : ''}`}>
      {grouped.map((group) => (
        <section
          key={group.category}
          className={`category-section category-${group.category.toLowerCase()}`}
        >
          <h1 className="category-title">{group.category}</h1>
          <div style={{ textAlign: 'left' }}>
            {group.drinks.map((drink) => (
              <DrinkCard key={drink.id} recipe={drink} />
            ))}
          </div>
        </section>
      ))}
      <OrderBar />
      <BottomNav />
    </div>
  );
}
