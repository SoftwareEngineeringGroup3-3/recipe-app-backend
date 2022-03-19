const { JointDatabaseObject } = require('../databaseObject');

class Recipe extends JointDatabaseObject {
    constructor(id=null) {
        super('recipes', id, !!id);
        this.bindProperty('id','recipe_id')
        this.bindProperty('name', 'recipe_name');
        this.bindProperty('instructions', 'recipe_instructions');
        //need to store list of (ingredient_id, quantity) tuple here somehow.
        this.bindProperty('tags', 'recipe_tags');
    }
}

// function validateName(name) {
//     return (!name.match(/\W|\d/gi));
// }

// const ingredientFormat = {
//     rec: { required: true, type: 'string', lambda: validateName },
//     ingredient_photo: { required: false, type: 'string', lambda: () => {}}
// };

// module.exports = { Ingredient, validateName, ingredientFormat };