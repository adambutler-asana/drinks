import { collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

const CATEGORIES = ['Whiskey', 'Gin', 'Rum', 'Tequila', 'Spritz', 'Mocktails'];

const recipes = [
  // --- Whiskey (matches original site order) ---
  {
    id: 'old-fashioned',
    name: 'Old Fashioned',
    category: 'Whiskey',
    sortOrder: 0,
    shortDescription: 'Bourbon, bitters, brown sugar, orange peel, large cube',
    ingredients: [
      { amount: '2 oz', item: "Maker's Mark bourbon" },
      { amount: '4 dashes', item: 'Angostura bitters' },
      { amount: '4 dashes', item: 'orange bitters' },
      { amount: '1/2 oz', item: 'brown sugar simple syrup' },
      { amount: '', item: 'Orange peel' },
      { amount: '', item: 'Large ice cube' },
    ],
    steps: [
      'Pour bitters and simple syrup in old fashioned glass',
      'Place large ice cube in glass',
      'Pour bourbon over the ice',
      'Express orange peel over glass and place the peel in the glass',
      'Stir for 20 seconds',
    ],
  },
  {
    id: 'whiskey-sour',
    name: 'Whiskey Sour',
    category: 'Whiskey',
    sortOrder: 1,
    shortDescription: 'Bourbon, lemon, simple syrup, egg whites, bitters',
    ingredients: [
      { amount: '2 oz', item: 'bourbon' },
      { amount: '1 3/4 oz', item: 'lemon juice' },
      { amount: '3/4 oz', item: 'simple syrup' },
      { amount: '1', item: 'egg white' },
      { amount: '', item: 'Angostura bitters' },
    ],
    steps: [
      'Dry shake with all ingredients',
      'Shake with ice',
      'Strain over coupe glass',
      'Let it settle for a minute',
      'Several drops of bitters on top',
    ],
  },
  {
    id: 'paper-plane',
    name: 'Paper Plane',
    category: 'Whiskey',
    sortOrder: 2,
    shortDescription: 'Bourbon, aperol, nonino, lemon',
    ingredients: [
      { amount: '1 oz', item: 'bourbon' },
      { amount: '1 oz', item: 'Aperol' },
      { amount: '1 oz', item: 'amaro nonino' },
      { amount: '1 oz', item: 'lemon juice' },
    ],
    steps: [
      'Shake all ingredients with ice',
      'Strain into coupe glass',
    ],
  },
  {
    id: 'manhattan',
    name: 'Manhattan',
    category: 'Whiskey',
    sortOrder: 3,
    shortDescription: 'Rye, sweet vermouth, bitters, cherries',
    ingredients: [
      { amount: '2 oz', item: 'rye whiskey' },
      { amount: '1 oz', item: 'sweet vermouth' },
      { amount: '1 dash', item: 'Angostura bitters' },
      { amount: '1 dash', item: 'orange bitters' },
      { amount: '', item: 'Cherries' },
    ],
    steps: [
      'Add all ingredients to a mixing glass',
      'Stir for 20 seconds',
      'Strain into coupe glass',
      'Garnish with cherries on a pick',
    ],
  },
  {
    id: 'black-manhattan',
    name: 'Black Manhattan',
    category: 'Whiskey',
    sortOrder: 4,
    shortDescription: 'Rye, averna, bitters, cherries',
    ingredients: [
      { amount: '2 oz', item: 'rye whiskey' },
      { amount: '1 oz', item: 'Averna amaro' },
      { amount: '1 dash', item: 'Angostura bitters' },
      { amount: '1 dash', item: 'orange bitters' },
      { amount: '', item: 'Cherries' },
    ],
    steps: [
      'Add all ingredients to a mixing glass',
      'Stir for 20 seconds',
      'Strain into coupe glass',
      'Garnish with cherries on a pick',
    ],
  },
  {
    id: 'boulevardier',
    name: 'Boulevardier',
    category: 'Whiskey',
    sortOrder: 5,
    shortDescription: 'Rye, sweet vermouth, campari, orange peel, large cube',
    ingredients: [
      { amount: '1 1/4 oz', item: 'rye whiskey' },
      { amount: '3/4 oz', item: 'Campari' },
      { amount: '1 oz', item: 'sweet vermouth' },
      { amount: '', item: 'Orange peel' },
      { amount: '', item: 'Large ice cube' },
    ],
    steps: [
      'Pour all ingredients in a mixing glass',
      'Stir for 20 seconds',
      'Strain into old fashioned glass with large ice cube',
      'Garnish with orange peel',
    ],
  },
  // --- Gin (matches original site order) ---
  {
    id: 'negroni',
    name: 'Negroni',
    category: 'Gin',
    sortOrder: 0,
    shortDescription: 'Gin, campari, sweet vermouth, orange peel, large cube',
    ingredients: [
      { amount: '1 1/4 oz', item: 'gin' },
      { amount: '3/4 oz', item: 'Campari' },
      { amount: '1 oz', item: 'sweet vermouth' },
      { amount: '', item: 'Orange peel' },
      { amount: '', item: 'Large ice cube' },
    ],
    steps: [
      'Pour all ingredients in a mixing glass',
      'Stir for 20 seconds',
      'Strain into old fashioned glass with large ice cube',
      'Garnish with orange peel',
    ],
  },
  {
    id: 'tangerine-dream',
    name: 'Tangerine Dream',
    category: 'Gin',
    sortOrder: 1,
    shortDescription: 'Gin, tangerine, lime, simple syrup, egg whites, nutmeg',
    ingredients: [
      { amount: '2 oz', item: 'gin' },
      { amount: '1 1/2 oz', item: 'tangerine juice' },
      { amount: '1/2 oz', item: 'lime juice' },
      { amount: '3/4 oz', item: 'simple syrup' },
      { amount: '1', item: 'egg white' },
      { amount: '1/4 tsp', item: 'nutmeg' },
    ],
    steps: [
      'Dry shake with all ingredients',
      'Shake with ice',
      'Double-strain over coupe glass',
      'Sprinkle nutmeg on top and add 1 drop of bitters',
    ],
  },
  {
    id: 'clover-club',
    name: 'Clover Club',
    category: 'Gin',
    sortOrder: 2,
    shortDescription: 'Gin, raspberries, dry vermouth, lemon, simple syrup, egg whites',
    ingredients: [
      { amount: '2 oz', item: 'gin' },
      { amount: '1/2 oz', item: 'dry vermouth' },
      { amount: '1/2 oz', item: 'lemon juice' },
      { amount: '1/2 oz', item: 'simple syrup' },
      { amount: '1', item: 'egg white' },
      { amount: '3-4', item: 'raspberries' },
    ],
    steps: [
      'Pour raspberries and simple syrup into a shaker and muddle',
      'Add remaining ingredients and dry shake',
      'Shake with ice',
      'Double-strain into coupe glass (get the raspberry chunks out)',
      'Garnish with skewered raspberry',
    ],
  },
  {
    id: 'gin-fizz',
    name: 'Gin Fizz',
    category: 'Gin',
    sortOrder: 3,
    shortDescription: 'Gin, lemon, simple syrup, egg whites, club soda',
    ingredients: [
      { amount: '2 oz', item: 'gin' },
      { amount: '1 oz', item: 'lemon juice' },
      { amount: '3/4 oz', item: 'simple syrup' },
      { amount: '1', item: 'egg white' },
      { amount: '1 oz', item: 'club soda' },
    ],
    steps: [
      'Dry shake gin, lemon juice, simple syrup, and egg white',
      'Add ice and shake again',
      'Strain over coupe glass',
      'Top with club soda',
    ],
  },
  {
    id: 'corpse-reviver',
    name: 'Corpse Reviver No. 2',
    category: 'Gin',
    sortOrder: 4,
    shortDescription: 'Gin, lillet blanc, lemon, cointreau, absinthe',
    ingredients: [
      { amount: '1 oz', item: 'gin' },
      { amount: '1 oz', item: 'Lillet blanc' },
      { amount: '1 oz', item: 'Cointreau' },
      { amount: '1 oz', item: 'lemon juice' },
      { amount: '', item: 'Absinthe wash' },
    ],
    steps: [
      'Rinse the inside of a coupe glass with absinthe. Discard excess.',
      'Shake all other ingredients with ice.',
      'Strain into the coupe glass.',
    ],
  },
  {
    id: 'gimlet',
    name: 'Gimlet',
    category: 'Gin',
    sortOrder: 5,
    shortDescription: 'Gin, lime, simple syrup, lime wheel',
    ingredients: [
      { amount: '2 oz', item: 'gin' },
      { amount: '3/4 oz', item: 'lime juice' },
      { amount: '3/4 oz', item: 'simple syrup' },
      { amount: '', item: 'Lime wheel' },
    ],
    steps: [
      'Add all ingredients to a shaker and shake with ice',
      'Strain over coupe glass',
      'Garnish with lime wheel',
    ],
  },
  // --- Rum (matches original site order) ---
  {
    id: 'classic-daiquiri',
    name: 'Classic Daiquiri',
    category: 'Rum',
    sortOrder: 0,
    shortDescription: 'White rum, lime, simple syrup, lime wheel',
    ingredients: [
      { amount: '2 oz', item: 'light rum' },
      { amount: '1 oz', item: 'lime juice' },
      { amount: '3/4 oz', item: 'simple syrup' },
      { amount: '', item: 'Lime wheel' },
    ],
    steps: [
      'Add all ingredients to a shaker and shake with ice',
      'Strain over coupe glass',
      'Garnish with lime wheel',
    ],
  },
  {
    id: 'jungle-bird',
    name: 'Jungle Bird',
    category: 'Rum',
    sortOrder: 1,
    shortDescription: 'Jamaican rum, campari, lime, simple syrup, pineapple',
    ingredients: [
      { amount: '2 oz', item: 'Jamaican rum' },
      { amount: '3/4 oz', item: 'Campari' },
      { amount: '1/2 oz', item: 'lime juice' },
      { amount: '1/2 oz', item: 'simple syrup' },
      { amount: '1 1/2 oz', item: 'pineapple juice' },
    ],
    steps: [
      'Shake all ingredients in shaker with ice.',
      'Strain over ice in rocks glass or tiki mug.',
    ],
  },
  {
    id: 'rum-old-fashioned',
    name: 'Rum Old Fashioned',
    category: 'Rum',
    sortOrder: 2,
    shortDescription: 'Aged rum, allspice, demerara syrup, bitters, lemon peel, large cube',
    ingredients: [
      { amount: '2.5 oz', item: 'aged rum' },
      { amount: '1/4 oz', item: 'allspice dram (alt: sweet vermouth)' },
      { amount: '1/2 oz', item: 'demerara syrup' },
      { amount: '1/4 oz', item: 'simple syrup' },
      { amount: '', item: 'Orange & Angostura bitters' },
      { amount: '', item: 'Lemon peel' },
      { amount: '', item: 'Large ice cube' },
    ],
    steps: [
      'Pour bitters and simple syrup in old fashioned glass',
      'Place large ice cube in glass',
      'Pour rum and allspice dram over the ice',
      'Stir for 20 seconds',
      'Express lemon peel over glass and place the peel in the glass',
    ],
  },
  {
    id: 'planters-punch',
    name: "Planter's Punch",
    category: 'Rum',
    sortOrder: 3,
    shortDescription: 'Jamaican rum, lime, allspice, demerara syrup, bitters, mint sprig',
    ingredients: [
      { amount: '3 oz', item: 'aged Jamaican rum' },
      { amount: '1 oz', item: 'lime juice' },
      { amount: '3/4 oz', item: 'demerara syrup' },
      { amount: '1/4 oz', item: 'allspice dram' },
      { amount: '2 dashes', item: 'Angostura bitters' },
      { amount: '', item: 'Mint sprig' },
    ],
    steps: [
      'Shake all ingredients in shaker with ice.',
      'Open pour into tall glass or tiki mug.',
      'Garnish with mint sprig.',
    ],
  },
  {
    id: 'mai-tai',
    name: 'Mai Tai',
    category: 'Rum',
    sortOrder: 4,
    shortDescription: 'Jamaican rum, lime, orange curaçao, orgeat, simple syrup, mint sprig',
    ingredients: [
      { amount: '2 1/2 oz', item: 'aged Jamaican rum' },
      { amount: '3/4 oz', item: 'lime juice' },
      { amount: '1/2 oz', item: 'orange curaçao' },
      { amount: '1/2 oz', item: 'orgeat syrup' },
      { amount: '1/2 oz', item: 'simple syrup' },
      { amount: '', item: 'Lime wheel' },
      { amount: '', item: 'Mint sprig' },
    ],
    steps: [
      'Shake all ingredients in shaker with ice.',
      'Strain over ice in rocks glass or tiki mug.',
      'Garnish with lime wheel, mint sprig, and a straw.',
    ],
  },
  {
    id: 'koana-puffer',
    name: 'Koana Puffer',
    category: 'Rum',
    sortOrder: 5,
    shortDescription: 'Gin, aged rum, pineapple, lemon, orgeat, simple syrup, orange curaçao',
    ingredients: [
      { amount: '2 oz', item: 'gin' },
      { amount: '1/2 oz', item: 'aged rum' },
      { amount: '1 1/2 oz', item: 'pineapple juice' },
      { amount: '1 oz', item: 'lemon juice' },
      { amount: '1/2 oz', item: 'orgeat syrup' },
      { amount: '1/2 oz', item: 'simple syrup' },
      { amount: '1/2 oz', item: 'orange curaçao' },
    ],
    steps: [
      'Shake all ingredients in shaker with ice.',
      'Open pour into tall glass or tiki mug.',
    ],
  },
  {
    id: 'mojito',
    name: 'Mojito',
    category: 'Rum',
    sortOrder: 6,
    shortDescription: 'White rum, lime, fresh mint, simple syrup, club soda, lime wheel',
    ingredients: [
      { amount: '2 oz', item: 'white rum' },
      { amount: '1 oz', item: 'lime juice' },
      { amount: '1/2 oz', item: 'simple syrup' },
      { amount: '', item: 'Soda water' },
      { amount: '2 sprigs', item: 'fresh mint (8-10 leaves each)' },
      { amount: '', item: 'Lime wheel' },
    ],
    steps: [
      'Clap mint sprig in hand to wake it up',
      'Gently press mint leaves with back of bar spoon in a tall glass to express oils',
      'Rub mint leaves/oil on inside of the glass',
      'Fill glass with ice to the top',
      'Pour rum, lime juice, and simple syrup into a shaker and shake with ice',
      'Strain into glass',
      'Top with soda water',
      'Use bar spoon to gently incorporate mint leaves up into the drink',
      'Garnish with fresh mint sprig and lime wheel',
    ],
  },
  {
    id: 'cuban-pool-boy',
    name: 'Cuban Pool Boy',
    category: 'Rum',
    sortOrder: 7,
    shortDescription: 'Aged rum, lime, champagne, simple syrup, egg whites, fresh mint, bitters, nutmeg, large cube',
    ingredients: [
      { amount: '2 oz', item: 'aged rum' },
      { amount: '3/4 oz', item: 'lime juice' },
      { amount: '3/4 oz', item: 'brown sugar simple syrup' },
      { amount: '1 oz', item: 'champagne' },
      { amount: '1 oz', item: 'egg whites' },
      { amount: '', item: 'Angostura bitters' },
      { amount: '6', item: 'mint leaves' },
      { amount: '', item: 'Nutmeg' },
      { amount: '', item: 'Large cube' },
    ],
    steps: [
      'Lightly muddle mint leaves in a shaker with simple syrup and lime juice',
      'Add in rum, egg whites, & bitters',
      'Shake with ice',
      'Double-strain into rocks glass to filter out mint fragments',
      'Top with champagne',
      'Garnish with sprinkle of nutmeg',
    ],
  },
  // --- Tequila (matches original site order) ---
  {
    id: 'margarita',
    name: 'Margarita',
    category: 'Tequila',
    sortOrder: 0,
    shortDescription: 'Blanco, lime, cointreau, agave nectar, lime wheel',
    ingredients: [
      { amount: '2 oz', item: 'blanco or reposado tequila' },
      { amount: '1 oz', item: 'lime juice' },
      { amount: '1 oz', item: 'Cointreau' },
      { amount: '1/4 oz', item: 'agave syrup' },
      { amount: '', item: 'Lime wheel' },
      { amount: '', item: 'Kosher salt (optional)' },
    ],
    steps: [
      'Shake all ingredients in shaker with ice.',
      'Optional: Rub lime on glass edge and dip glass in kosher salt',
      'Strain over ice in rocks glass',
      'Garnish with lime wheel',
    ],
  },
  {
    id: 'tequila-sour',
    name: 'Tequila Sour',
    category: 'Tequila',
    sortOrder: 1,
    shortDescription: 'Reposado, lime, simple syrup, egg whites, bitters',
    ingredients: [
      { amount: '2 oz', item: 'reposado tequila' },
      { amount: '1/2 oz', item: 'lime juice' },
      { amount: '1/2 oz', item: 'lemon juice' },
      { amount: '1/2 oz', item: 'simple syrup or agave syrup' },
      { amount: '1', item: 'egg white' },
      { amount: '', item: 'Angostura bitters' },
    ],
    steps: [
      'Dry shake with all ingredients',
      'Shake with ice',
      'Strain over coupe glass',
      'Let it settle for a minute',
      'Place a few drops of bitters on top',
    ],
  },
  {
    id: 'paloma',
    name: 'Paloma',
    category: 'Tequila',
    sortOrder: 2,
    shortDescription: 'Blanco, grapefruit, lime, simple syrup, club soda, grapefruit slice',
    ingredients: [
      { amount: '2 oz', item: 'blanco tequila' },
      { amount: '2 oz', item: 'grapefruit juice' },
      { amount: '1/2 oz', item: 'lime juice' },
      { amount: '3/4 oz', item: 'simple syrup' },
      { amount: '2 oz', item: 'soda water' },
      { amount: '', item: 'Kosher salt' },
    ],
    steps: [
      'Shake all ingredients in shaker with ice.',
      'Optional: Rub grapefruit on glass edge and dip glass in kosher salt',
      'Strain over ice in rocks glass',
      'Garnish with grapefruit slice',
    ],
  },
  // --- Spritz (matches original site order) ---
  {
    id: 'aperol-spritz',
    name: 'Aperol Spritz',
    category: 'Spritz',
    sortOrder: 0,
    shortDescription: 'Champagne, aperol, club soda, orange slice',
    ingredients: [
      { amount: '4 oz', item: 'Prosecco or champagne' },
      { amount: '3-4 oz', item: 'Aperol (to taste)' },
      { amount: '', item: 'Soda water' },
      { amount: '', item: 'Orange slice' },
    ],
    steps: [
      'Pour Prosecco and Aperol into a wine glass with ice',
      'Top with soda water',
      'Stir a little',
      'Garnish with orange slice',
    ],
  },
  {
    id: 'campari-spritz',
    name: 'Campari Spritz',
    category: 'Spritz',
    sortOrder: 1,
    shortDescription: 'Prosecco, campari, club soda, orange slice',
    ingredients: [
      { amount: '4 oz', item: 'Prosecco' },
      { amount: '2 oz', item: 'Campari' },
      { amount: '', item: 'Club soda' },
      { amount: '', item: 'Orange slice' },
    ],
    steps: [],
  },
  {
    id: 'americano',
    name: 'Americano',
    category: 'Spritz',
    sortOrder: 2,
    shortDescription: 'Sweet vermouth, campari, club soda, orange slice',
    ingredients: [
      { amount: '1 oz', item: 'Campari' },
      { amount: '1 oz', item: 'sweet vermouth' },
      { amount: '1 oz', item: 'club soda' },
      { amount: '', item: 'Orange peel' },
    ],
    steps: [
      'Pour all ingredients in a mixing glass',
      'Stir for 20 seconds',
      'Strain into rocks glass with ice',
      'Garnish with orange peel',
    ],
  },
  {
    id: 'wine-spritzer',
    name: 'Wine Spritzer',
    category: 'Spritz',
    sortOrder: 3,
    shortDescription: 'Pinot noir, aperol, lime, club soda, orange slice',
    ingredients: [
      { amount: '2 oz', item: 'pinot noir' },
      { amount: '1 oz', item: 'aperol' },
      { amount: '1/2 oz', item: 'lime juice' },
      { amount: '1 oz', item: 'club soda' },
      { amount: '', item: 'Orange slice' },
    ],
    steps: [
      'Fill a rocks or stemless wine glass with ice',
      'Pour ingredients over ice',
      'Stir',
      'Garnish with orange slice',
    ],
  },
  // --- Mocktails (matches original site order) ---
  {
    id: 'mock-scow-mule',
    name: 'Mock-scow Mule',
    category: 'Mocktails',
    sortOrder: 0,
    shortDescription: 'Ginger beer, lime, simple syrup, mint, club soda, lime wheel',
    ingredients: [
      { amount: '4 oz', item: 'ginger beer' },
      { amount: '1 oz', item: 'lime juice' },
      { amount: '1/2 oz', item: 'simple syrup' },
      { amount: '', item: 'Fresh mint' },
      { amount: '2 oz', item: 'club soda' },
      { amount: '', item: 'Lime wheel' },
    ],
    steps: [
      'Fill a copper mug or rocks glass with ice',
      'Add lime juice and simple syrup',
      'Pour ginger beer and club soda over ice',
      'Stir gently',
      'Garnish with mint sprig and lime wheel',
    ],
  },
  {
    id: 'strawberry-faux-jito',
    name: 'Strawberry Faux-jito',
    category: 'Mocktails',
    sortOrder: 1,
    shortDescription: 'Sprite, strawberries, mint, lime, lime wheel',
    ingredients: [
      { amount: '', item: 'Sprite' },
      { amount: '3-4', item: 'strawberries' },
      { amount: '', item: 'Fresh mint' },
      { amount: '1/2', item: 'lime, juiced' },
      { amount: '', item: 'Lime wheel' },
    ],
    steps: [
      'Muddle strawberries and mint in a tall glass',
      'Fill glass with ice',
      'Add lime juice',
      'Top with Sprite',
      'Stir gently',
      'Garnish with lime wheel',
    ],
  },
];

export { recipes, CATEGORIES };

export async function seedRecipes() {
  const snap = await getDocs(collection(db, 'recipes'));
  if (snap.size > 0) {
    console.log('Recipes collection already has data, skipping seed.');
    return false;
  }

  console.log('Seeding recipes...');
  for (const recipe of recipes) {
    const { id, ...data } = recipe;
    data.createdAt = new Date();
    data.updatedAt = new Date();
    await setDoc(doc(db, 'recipes', id), data);
  }
  console.log(`Seeded ${recipes.length} recipes.`);
  return true;
}

export async function reseedRecipes() {
  console.log('Re-seeding recipes (updating all)...');
  // Delete el-presidente if it exists
  try {
    await deleteDoc(doc(db, 'recipes', 'el-presidente'));
    console.log('Removed el-presidente');
  } catch (e) {
    // ignore if doesn't exist
  }
  for (const recipe of recipes) {
    const { id, ...data } = recipe;
    data.updatedAt = new Date();
    await setDoc(doc(db, 'recipes', id), data, { merge: true });
  }
  console.log(`Re-seeded ${recipes.length} recipes.`);
  return true;
}
