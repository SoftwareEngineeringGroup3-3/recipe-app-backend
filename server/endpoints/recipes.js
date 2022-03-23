const { ApiObject, ApiError } = require ('../apiobject.js');
const { Recipe, validateRecipeName,validateRecipeInstructions, validateRecipeTags, 
    validateRecipeIngredients, recipeFormat, convertDataIngredients, convertDataTags } = require ('../templates/recipes');

const recipePostFormat = {
    name: { required: true, type: 'string', lambda: validateRecipeName },
    instructions: { required: false, type: 'string', lambda: validateRecipeInstructions },
    tags: { required: false, type: 'object', lambda: validateRecipeTags },
    ingredients : {required: true, type: 'object', lambda: validateRecipeIngredients}
};

class ApiRecipeObject extends ApiObject {

    // I think we can have recipes with the same names ? 
    async post(req) {
        console.log("endpoints/recipe: recieved post")
        this.enforceContentType(req, 'application/json');
        const data = this.parseAndValidate(req.body, recipePostFormat, true);
        // checkDataUniqueness(req,data.name);
        var recipe = new Recipe();
        recipe.name = data.name;
        recipe.instructions = data.instructions;
        recipe.tags = convertDataTags(data.tags);
        recipe.ingredients = convertDataIngredients(data.ingredients);
        recipe.insert(req.database);
        if(!recipe.id)
        {
            throw new Error('Recipe creation failed');
        }
        return data;
    }
}

module.exports = ApiRecipeObject;