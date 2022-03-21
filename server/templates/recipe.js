const bcrypt = require('bcrypt');
const { DatabaseObject } = require('../databaseObject');

class Recipe extends DatabaseObject {
    constructor(id=null) {
        super('recipes', id, !!id);
        this.bindProperty('id','recipe_id')
        this.bindProperty('name', 'recipe_name');
        this.bindProperty('instructions', 'recipe_instructions');
        this.bindProperty('tags', 'recipe_tags');
        this.bindProperty('ingredients','recipe_ingredients');
    }
}

function validateRecipeName(name) {
    return (name.length >= 5 && name.length <= 100);
}

function validateRecipeInstructions(instructions) {
    return ( instructions.length <= 1000);
}

function validateRecipeTags(tag) {
    return ( tag.length >=3 && tag.length <= 25 );
}
function validateRecipeIngredients(ingridients)
{
    return ( ingridients.length > 2 && ingridients.match(/(\d+:\d+);(\d+:\d+)/g));
}

const recipeFormat = {
    recipe_name: { required: true, type: 'string', lambda: validateRecipeName },
    recipe_instructions: { required: false, type: 'string', lambda: validateRecipeInstructions },
    recipe_tags: { required: false, type: 'string', lambda: validateRecipeTags },
    recipe_ingredients : {required: true, type: 'string', lambda: validateRecipeIngredients}
};

module.exports = { Recipe, validateRecipeName, validateRecipeInstructions,
    validateRecipeTags, validateRecipeIngredients, recipeFormat  };