const { validateUsername, validatePassword } = require ('../server/templates/user.js');


test('Is validate username working', () => {
    expect(validateUsername("Mam")).toBe(false);
});

test('Is validate password working', () => {
    expect(validatePassword("123 45")).toBe(false);
});

test('Is validate username working', () => {
    expect(validateUsername("gagfagaf")).toBe(true);
});

test('Is validate password working', () => {
    expect(validatePassword("12345")).toBe(true);
});