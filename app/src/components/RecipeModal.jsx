export default function RecipeModal({ recipe, onClose }) {
  if (!recipe) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">
          {recipe.emoji} {recipe.name}
        </div>
        <div className="modal-category">{recipe.category}</div>

        {recipe.ingredients?.length > 0 && (
          <>
            <div className="modal-section-title">Ingredients</div>
            {recipe.ingredients.map((ing, i) => (
              <div key={i} className="modal-ingredient">
                {ing.amount && (
                  <span className="modal-ingredient-amount">{ing.amount}</span>
                )}
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

        <button
          className="btn btn-secondary btn-block"
          onClick={onClose}
          style={{ marginTop: 24 }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
