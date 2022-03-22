const bcrypt = require('bcrypt');
const { DatabaseObject } = require('../databaseObject');
const { Ingredient } = require ('../templates/ingredients.js');

class Recipe extends DatabaseObject {
    constructor(id=null) {
        super('recipes', id, !!id);
        this.bindProperty('id','recipe_id', this.id)
        this.bindProperty('name', 'recipe_name');
        this.bindProperty('instructions', 'recipe_instructions');
        this.bindProperty('tags', 'recipe_tags');
        this.bindProperty('ingredients','recipe_ingredients');
    }
}

function validateRecipeName(name) {
    return (name.length >= 3 && name.length <= 100);
}

function validateRecipeInstructions(instructions) {
    return ( instructions.length <= 1000);
}

function validateRecipeTags(tag) {
    return ( tag.length >=3 && tag.length <= 25 );
}
function validateRecipeIngredients(recipeIngredient)
{
    return checkRecipeIngredientFormat(recipeIngredient);
}

function checkRecipeIngredientFormat(recipeIngredient)
{
    if ( recipeIngredient.length < 0)
    {
        return false;
    }
    for( let i = 0; i < recipeIngredient.length; i++)
    {
        if ( recipeIngredient[i].length != 2)
        {
            return false;
        }
        if (!(recipeIngredient[i][0] instanceof Ingredient))
        {
            return false;
        }
        if (!( typeof recipeIngredient[i][1] == 'string'))
        {
            return false;
        }
    }
    return true;
}

const recipeFormat = {
    recipe_name: { required: true, type: 'string', lambda: validateRecipeName },
    recipe_instructions: { required: false, type: 'string', lambda: validateRecipeInstructions },
    recipe_tags: { required: false, type: 'string', lambda: validateRecipeTags },
    recipe_ingredients : {required: true, type: 'array', lambda: validateRecipeIngredients}
};

module.exports = { Recipe, validateRecipeName, validateRecipeInstructions,
    validateRecipeTags, validateRecipeIngredients, recipeFormat  };