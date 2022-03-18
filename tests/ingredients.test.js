const { validateName } = require ('../server/templates/ingredients.js');


test('99 as ingredient name is invalid:', () => {
    expect(validateName("99")).toBe(false);
});

test('"bs l@l" as ingredient name is invalid:', () => {
    expect(validateName("bs l@l")).toBe(false);
});

test('Cheese as ingredient name is valid:', () => {
    expect(validateName("Cheese")).toBe(true);
});
