const { ApiObject, ApiError } = require ('../apiobject.js');
const { Recipe, validateRecipeName,validateRecipeInstructions, validateRecipeTags, 
    validateRecipeIngredients, recipeFormat } = require ('../templates/recipe.js');

const recipeClassFormat = {
    id :{required: false, type:'number', lambda: ()=> {return true;}},
    name: { required: true, type: 'string', lambda: validateRecipeName },
    instructions: { required: false, type: 'string', lambda: validateRecipeInstructions },
    tags: { required: false, type: 'string', lambda: validateRecipeTags },
    ingredients : {required: true, type: 'string', lambda: validateRecipeIngredients}
};

function validationOfRecipe(recipe)
{
    if(!validateRecipeName(recipe.name))
    {
        throw new ApiError(400,"Wrong Name")
    }
    if(!validateRecipeInstructions(recipe.instructions))
    {
        throw new ApiError(400,"Wrong Instruction")
    }
    if(!validateRecipeTags(recipe.tags))
    {
        throw new ApiError(400,"Wrong Tag")
    }
    if(!validateRecipeIngredients(recipe.ingredients))
    {
        throw new ApiError(400,"Wrong Ingredient")
    }
}

class ApiRecipeObject extends ApiObject {
    async get(req) {
        // 200 - Ok 
        // 401 - User not aouthorized
        throw new ApiError(405, 'method unsupported');
    }
    // I think we can have recipes with the same names ? 
    async post(req) {
        console.log("endpoints/recipe: recieved post")
        this.enforceContentType(req, 'application/json');
        const data = this.parseAndValidate(req.body, recipeClassFormat, true);
        // checkDataUniqueness(req,data.name);
        var recipe = new Recipe();
        recipe.name = data.name;
        recipe.instructions = data.instructions;
        recipe.tags = data.tags;
        recipe.ingredients = data.ingredients;
        validationOfRecipe(recipe);
        recipe.insert(req.database);
        if(!recipe.id)
        {
            throw new Error('Recipe creation failed');
        }
        recipe=recipe.serialize();
        return recipe;
    }

    async delete(req) { 
        throw new ApiError(405, 'method unsupported');
    }

    async put(req) {
        throw new ApiError(405, 'method unsupported');
    }
}

module.exports = ApiRecipeObject;