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

        if(!req.user || req.user.isAdmin != 1) {
            throw new ApiError(401, 'User is not authorized!');
        }

        this.enforceContentType(req, 'application/json');
        const data = this.parseAndValidate(req.body, recipePostFormat, true);
        // checkDataUniqueness(req,data.name);
        let recipe = new Recipe();
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

    async delete(req) {
        console.log("endpoints/recipe: recieved delete")

        if(!req.user || req.user.isAdmin != 1) {
            throw new ApiError(401, 'User is not authorized!');
        }
        if(!req.params.id)
        {
            throw new ApiError(403, 'Validation exception.');
        }
        //this.enforceContentType(req, 'application/json');
        let recipe= new Recipe(req.params.id);
        if(!recipe.fetch(req.database)) //fetch, when succesful, populates the other fields of the ingredient apart from the id.
        {
            throw new ApiError(404, 'Recipe not found')
        }
        recipe.delete(req.database);
        return recipe.serialize();
    }
}

module.exports = ApiRecipeObject;