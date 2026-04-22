import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecipe, saveRecipe, deleteRecipe } from '../services/firebase';
import { CATEGORIES } from '../services/seedData';
import BottomNav from '../components/BottomNav';

const emptyRecipe = {
  name: '',
  emoji: '',
  category: 'Whiskey',
  shortDescription: '',
  ingredients: [{ amount: '', item: '' }],
  steps: [''],
};

export default function AdminRecipeDetail() {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const isNew = recipeId === 'new';
  const [recipe, setRecipe] = useState(null);
  const [editing, setEditing] = useState(isNew);
  const [form, setForm] = useState(emptyRecipe);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew) {
      getRecipe(recipeId).then((r) => {
        if (r) {
          setRecipe(r);
          setForm(r);
        }
      });
    } else {
      setRecipe(emptyRecipe);
      setForm(emptyRecipe);
    }
  }, [recipeId, isNew]);

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function updateIngredient(idx, field, value) {
    setForm((f) => ({
      ...f,
      ingredients: f.ingredients.map((ing, i) =>
        i === idx ? { ...ing, [field]: value } : ing
      ),
    }));
  }

  function addIngredient() {
    setForm((f) => ({ ...f, ingredients: [...f.ingredients, { amount: '', item: '' }] }));
  }

  function removeIngredient(idx) {
    setForm((f) => ({ ...f, ingredients: f.ingredients.filter((_, i) => i !== idx) }));
  }

  function updateStep(idx, value) {
    setForm((f) => ({
      ...f,
      steps: f.steps.map((s, i) => (i === idx ? value : s)),
    }));
  }

  function addStep() {
    setForm((f) => ({ ...f, steps: [...f.steps, ''] }));
  }

  function removeStep(idx) {
    setForm((f) => ({ ...f, steps: f.steps.filter((_, i) => i !== idx) }));
  }

  async function handleSave() {
    setSaving(true);
    const data = {
      ...form,
      ingredients: form.ingredients.filter((i) => i.item.trim()),
      steps: form.steps.filter((s) => s.trim()),
    };
    if (!isNew) data.id = recipeId;
    const id = await saveRecipe(data);
    setSaving(false);
    if (isNew) {
      navigate(`/admin/recipes/${id}`, { replace: true });
    } else {
      setRecipe({ ...data, id });
      setEditing(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${recipe.name}"?`)) return;
    await deleteRecipe(recipeId);
    navigate('/admin/recipes', { replace: true });
  }

  if (!recipe) return <div className="loading">Loading...</div>;

  if (!editing) {
    return (
      <div className="admin-page">
        <button className="btn btn-ghost" onClick={() => navigate('/admin/recipes')} style={{ marginBottom: 16 }}>
          ← Back
        </button>

        <h1 style={{ marginBottom: 4 }}>
          {recipe.emoji} {recipe.name}
        </h1>
        <div style={{ color: '#888', fontFamily: "'SF Mono', monospace", fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 20 }}>
          {recipe.category}
        </div>
        <div style={{ color: '#aaa', marginBottom: 20, fontFamily: "'SF Mono', monospace", fontSize: '0.875rem' }}>
          {recipe.shortDescription}
        </div>

        {recipe.ingredients?.length > 0 && (
          <>
            <div className="modal-section-title">Ingredients</div>
            {recipe.ingredients.map((ing, i) => (
              <div key={i} className="modal-ingredient">
                {ing.amount && <span className="modal-ingredient-amount">{ing.amount}</span>}
                {ing.item}
              </div>
            ))}
          </>
        )}

        {recipe.steps?.length > 0 && (
          <>
            <div className="modal-section-title">Steps</div>
            {recipe.steps.map((step, i) => (
              <div key={i} className="modal-step">
                <span className="modal-step-num">{i + 1}.</span>
                <span>{step}</span>
              </div>
            ))}
          </>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setEditing(true)}>
            Edit
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            Delete
          </button>
        </div>

        <BottomNav type="admin" />
      </div>
    );
  }

  // Edit / New mode
  return (
    <div className="admin-page">
      <h1>{isNew ? 'New Recipe' : 'Edit Recipe'}</h1>

      <div className="form-group">
        <label className="form-label">Name</label>
        <input className="form-input" value={form.name} onChange={(e) => updateField('name', e.target.value)} />
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Emoji</label>
          <input className="form-input" value={form.emoji} onChange={(e) => updateField('emoji', e.target.value)} />
        </div>
        <div className="form-group" style={{ flex: 2 }}>
          <label className="form-label">Category</label>
          <select className="form-input" value={form.category} onChange={(e) => updateField('category', e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Short Description</label>
        <input className="form-input" value={form.shortDescription} onChange={(e) => updateField('shortDescription', e.target.value)} />
      </div>

      <div className="form-group">
        <label className="form-label">Ingredients</label>
        {form.ingredients.map((ing, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              className="form-input"
              placeholder="Amount"
              value={ing.amount}
              onChange={(e) => updateIngredient(i, 'amount', e.target.value)}
              style={{ width: '35%' }}
            />
            <input
              className="form-input"
              placeholder="Ingredient"
              value={ing.item}
              onChange={(e) => updateIngredient(i, 'item', e.target.value)}
              style={{ flex: 1 }}
            />
            <button className="btn btn-ghost" onClick={() => removeIngredient(i)} style={{ padding: '8px 12px', minHeight: 'auto' }}>
              ×
            </button>
          </div>
        ))}
        <button className="btn btn-ghost" onClick={addIngredient} style={{ fontSize: '0.8125rem' }}>
          + Add Ingredient
        </button>
      </div>

      <div className="form-group">
        <label className="form-label">Steps</label>
        {form.steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
            <span style={{ color: '#CA4321', fontWeight: 700, fontFamily: "'SF Mono', monospace", fontSize: '0.875rem', flexShrink: 0 }}>
              {i + 1}.
            </span>
            <input
              className="form-input"
              value={step}
              onChange={(e) => updateStep(i, e.target.value)}
              style={{ flex: 1 }}
            />
            <button className="btn btn-ghost" onClick={() => removeStep(i)} style={{ padding: '8px 12px', minHeight: 'auto' }}>
              ×
            </button>
          </div>
        ))}
        <button className="btn btn-ghost" onClick={addStep} style={{ fontSize: '0.8125rem' }}>
          + Add Step
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving || !form.name.trim()}>
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button className="btn btn-ghost" onClick={() => isNew ? navigate('/admin/recipes') : setEditing(false)}>
          Cancel
        </button>
      </div>

      <BottomNav type="admin" />
    </div>
  );
}
