const { validateRecipeName, validateRecipeInstructions, 
  validateRecipeTags, validateRecipeIngredients} = require ('../server/templates/recipe.js');


test('Empty word is invalid name', () => {
    expect(validateRecipeName("")).toBe(false);
});

test("Name : 'Recipe for apple pie' is valid", () =>{
    expect(validateRecipeName("Recipe for apple pie")).toBe(true);
});

test("Invalid name", () =>{
  var longName = 'x';
  i = 0;
  while(i<100)
  {
    longName +='x'
    i++;
  }
  expect(validateRecipeName(longName)).toBe(false);
});

test('Valid recipe instructions', () => {
  expect(validateRecipeInstructions("Mix and serve :)")).toBe(true);
});

test('Too long recipe instructions', () => {
  var tooLongInstruction = 'x';
  i = 0;
  while(i<=1001)
  {
    tooLongInstruction +='x'
    i++;
  }
  expect(validateRecipeInstructions(tooLongInstruction)).toBe(false);
});

test('Too short Recipe Tag', () => {
  expect(validateRecipeTags('xy')).toBe(false);
});

test('Too long Recipe Tag', () => {
  var tooLongtag = 'x';
  i = 0;
  while(i<=26)
  {
    tooLongtag +='x'
    i++;
  }
  expect(validateRecipeTags(tooLongtag)).toBe(false);
});

test('Valid Recipe Tag', () => {
  expect(validateRecipeTags('Vege/Bio')).toBe(true);
});


