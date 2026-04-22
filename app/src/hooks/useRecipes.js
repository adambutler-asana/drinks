import { useEffect, useState } from 'react';
import { subscribeRecipes } from '../services/firebase';

export function useRecipes() {
  const [recipes, setRecipes] = useState(null);

  useEffect(() => {
    return subscribeRecipes(setRecipes);
  }, []);

  return recipes;
}
