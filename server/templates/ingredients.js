const { DatabaseObject } = require('../databaseObject');

class Ingredient extends DatabaseObject {
    constructor(id=null) {
        super('ingredients', id, !!id);

        this.bindProperty('id', 'ingredient_id', this.id);
        this.bindProperty('name', 'ingredient_name');
        this.bindProperty('photo', 'ingredient_photo');
    }
}

function validateName(name) {
    return (!name.match(/\W|\d/gi));
}

const ingredientFormat = {
    ingredient_name: { required: true, type: 'string', lambda: validateName },
    ingredient_photo: { required: false, type: 'string', lambda: () => {}}
};

module.exports = { Ingredient, validateName, ingredientFormat };