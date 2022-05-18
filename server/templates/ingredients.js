const { DatabaseObject } = require('../databaseObject');

class Ingredient extends DatabaseObject {
    constructor(id=null) {
        super('ingredients', id, !!id);

        this.bindProperty('id', 'ingredient_id', this.id);
        this.bindProperty('name', 'ingredient_name');
    }
}

function validateName(name) {
    return (!name.match(/[&._-]|\d/gi));
}

const ingredientFormat = {
    ingredient_name: { required: true, type: 'string', lambda: validateName },
};

module.exports = { Ingredient, validateName, ingredientFormat };