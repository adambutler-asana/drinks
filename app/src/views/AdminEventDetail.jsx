import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEvent, saveEvent, deleteEvent, Timestamp } from '../services/firebase';
import { useRecipes } from '../hooks/useRecipes';
import { CATEGORIES } from '../services/seedData';
import BottomNav from '../components/BottomNav';

export default function AdminEventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const isNew = eventId === 'new';
  const recipes = useRecipes();

  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [selectedDrinks, setSelectedDrinks] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew) {
      getEvent(eventId).then((evt) => {
        if (evt) {
          setName(evt.name || '');
          setDate(
            evt.date?.toDate
              ? evt.date.toDate().toISOString().split('T')[0]
              : ''
          );
          setIsActive(evt.isActive || false);
          setSelectedDrinks(evt.availableDrinks || []);
        }
      });
    }
  }, [eventId, isNew]);

  function toggleDrink(recipeId) {
    setSelectedDrinks((prev) =>
      prev.includes(recipeId)
        ? prev.filter((id) => id !== recipeId)
        : [...prev, recipeId]
    );
  }

  function selectAllCategory(cat) {
    const ids = recipes.filter((r) => r.category === cat).map((r) => r.id);
    setSelectedDrinks((prev) => [...new Set([...prev, ...ids])]);
  }

  function deselectAllCategory(cat) {
    const ids = recipes.filter((r) => r.category === cat).map((r) => r.id);
    setSelectedDrinks((prev) => prev.filter((id) => !ids.includes(id)));
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    const data = {
      name: name.trim(),
      date: date ? Timestamp.fromDate(new Date(date + 'T00:00:00')) : null,
      isActive,
      availableDrinks: selectedDrinks,
    };
    if (!isNew) data.id = eventId;
    await saveEvent(data);
    setSaving(false);
    navigate('/admin/events', { replace: true });
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${name}"?`)) return;
    await deleteEvent(eventId);
    navigate('/admin/events', { replace: true });
  }

  if (!recipes) return <div className="loading">Loading...</div>;

  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    drinks: recipes.filter((r) => r.category === cat),
  })).filter((g) => g.drinks.length > 0);

  return (
    <div className="admin-page">
      <button className="btn btn-ghost" onClick={() => navigate('/admin/events')} style={{ marginBottom: 16 }}>
        ← Back
      </button>

      <h1>{isNew ? 'New Event' : 'Edit Event'}</h1>

      <div className="form-group">
        <label className="form-label">Event Name</label>
        <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Summer BBQ 2026" />
      </div>

      <div className="form-group">
        <label className="form-label">Date</label>
        <input className="form-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="form-group">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label className="form-label" style={{ marginBottom: 0 }}>Active</label>
          <button
            className={`toggle ${isActive ? 'active' : ''}`}
            onClick={() => setIsActive(!isActive)}
            type="button"
          />
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <label className="form-label">
          Drinks ({selectedDrinks.length} selected)
        </label>

        {grouped.map((group) => {
          const allSelected = group.drinks.every((d) => selectedDrinks.includes(d.id));
          return (
            <div key={group.category} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontFamily: "'SF Mono', monospace", fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {group.category}
                </span>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '4px 10px', minHeight: 'auto', fontSize: '0.6875rem' }}
                  onClick={() => allSelected ? deselectAllCategory(group.category) : selectAllCategory(group.category)}
                >
                  {allSelected ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              {group.drinks.map((drink) => (
                <div
                  key={drink.id}
                  className="checklist-item"
                  onClick={() => toggleDrink(drink.id)}
                >
                  <div className={`checklist-check ${selectedDrinks.includes(drink.id) ? 'checked' : ''}`}>
                    {selectedDrinks.includes(drink.id) ? '✓' : ''}
                  </div>
                  <span style={{ color: '#e0e0e0', fontFamily: "'SF Mono', monospace", fontSize: '0.875rem' }}>
                    {drink.emoji} {drink.name}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving || !name.trim()}>
          {saving ? 'Saving...' : 'Save'}
        </button>
        {!isNew && (
          <button className="btn btn-danger" onClick={handleDelete}>
            Delete
          </button>
        )}
      </div>

      <BottomNav type="admin" />
    </div>
  );
}
