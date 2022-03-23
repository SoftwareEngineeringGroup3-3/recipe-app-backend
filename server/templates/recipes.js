const bcrypt = require('bcrypt');
const { DatabaseObject } = require('../databaseObject');
const { Ingredient } = require ('../templates/ingredients.js');
const sqlite = require('better-sqlite3');
const { ApiError } = require('../apiobject');

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

const tags_enum = Object.freeze({ VEGE: "vegetarian", GLUTEN_FREE: "gluten free", LOW_CALORIE: "low calorie", NO_LACTOSE: "no lactose" });

function validateRecipeName(name) {
    return (name.length >= 3 && name.length <= 100);
}

function validateRecipeInstructions(instructions) {
    return ( instructions.length <= 1000);
}

function validateRecipeTags(tags) {
    for(const tag of tags){
        if(tag != tags_enum.VEGE && tag != tags_enum.GLUTEN_FREE && tag != tags_enum.LOW_CALORIE && tag != tags_enum.NO_LACTOSE) return false;
    }
    return true;
}

function validateRecipeIngredients(recipeIngredients)
{
    return checkRecipeIngredientFormat(recipeIngredients);
}

function checkRecipeIngredientFormat(recipeIngredients)
{
    if ( recipeIngredients.length <= 0)
    {
        return false;
    }
    const db = new sqlite('database.db');
    for(const ingredient of recipeIngredients)
    {
        if (ingredient.ingredient.id == null || ingredient.ingredient.id == undefined)
        {
            return false;
        } else {

            const ingr = new Ingredient(ingredient.ingredient.id);
            if(!ingr.fetch(db)) return false;
        }
        if (ingredient.quantity == "" || (typeof ingredient.quantity) != "string" || parseInt(ingredient.quantity) <= 0)
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

const convertDataIngredients = (recipeIngredients) => 
{
    let finalVersion = "";
    for(const ingredient of recipeIngredients)
    {
        finalVersion += (ingredient.ingredient.id).toString();
        finalVersion += ':';
        finalVersion += ingredient.quantity;
        finalVersion += ';';
    }
    return finalVersion.substring(0, finalVersion.length - 1);
}

const convertDataTags = (recipeTags) => {
    let finalVersion = "";
    for(const tag of recipeTags)
    {
        finalVersion += tag;
        finalVersion += ';';
    }
    return finalVersion.substring(0, finalVersion.length - 1);
}



module.exports = { Recipe, validateRecipeName, validateRecipeInstructions,
    validateRecipeTags, validateRecipeIngredients, recipeFormat, convertDataIngredients, convertDataTags  };