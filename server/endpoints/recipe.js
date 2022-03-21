const { ApiObject, ApiError } = require ('../apiobject.js');
const { Recipe, validateRecipeName,validateRecipeInstructions, validateRecipeTags, 
    validateRecipeIngredients, recipeFormat } = require ('../templates/recipe.js');

const recipePostFormat = {
    id: {required: false, type: 'number', lambda: () => { return true; }},
    name: { required: true, type: 'string', lambda: validateRecipeName },
    instructions: {required: false, type: 'string', lambda: validateRecipeInstructions },
    tags: {required: false, type:'string', lambda: validateRecipeTags },
    ingredients: {required: true, type:'string', lambda: validateRecipeIngredients}
};

const recipeFetchFormat = {
    id: {required: true, type: 'number', lambda: () => { return true; }},
}

const recipePutFormat = {
    id: {required: true, type: 'number', lambda: () => { return true; }},
    name: { required: false, type: 'string', lambda: valivalidateRecipeNamedateName },
    instructions: {required: false, type: 'string', lambda: validateRecipeInstructions },
    tags: {required: false, type:'string', lambda: validateRecipeTags },
    ingredients: {required: true, type:'string', lambda: validateRecipeIngredients}
};


class ApiRecipetObject extends ApiObject {
    async get(req) {
        throw new ApiError(405, 'method unsupported');
    }

    async post(req) { 
        throw new ApiError(405, 'method unsupported');
    }

    async delete(req) { 
        throw new ApiError(405, 'method unsupported');
    }

    async put(req) {
        throw new ApiError(405, 'method unsupported');
    }
}

module.exports = ApiRecipeObject;