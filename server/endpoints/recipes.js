const { ApiObject, ApiError } = require ('../apiobject.js');
const { Recipe, validateRecipeName,validateRecipeInstructions, validateRecipeTags, 
    validateRecipeIngredients, recipeFormat, convertDataIngredients, convertDataTags } = require ('../templates/recipes');
const { Ingredient } = require('../templates/ingredients');

const recipePostFormat = {
    name: { required: true, type: 'string', lambda: validateRecipeName },
    instructions: { required: false, type: 'string', lambda: validateRecipeInstructions },
    tags: { required: false, type: 'object', lambda: validateRecipeTags },
    ingredients : {required: true, type: 'object', lambda: validateRecipeIngredients}
};

const recipePutFormat = {
    id: { required: true, type: 'number', lambda: () => { return true; } },
    name: { required: true, type: 'string', lambda: validateRecipeName },
    instructions: { required: false, type: 'string', lambda: validateRecipeInstructions },
    tags: { required: false, type: 'object', lambda: validateRecipeTags },
    ingredients : {required: true, type: 'object', lambda: validateRecipeIngredients}
};


const allRecipes = async (req) => {
    const db = req.database;
    const page = req.query.page;
    const limit = req.query.limit;

    let recipes = db.prepare('SELECT * FROM recipes').all();
    let pageRecipes = [];
    for(let i = (page-1) * limit; i < page*limit; i++) {
        if(recipes[i] != null) pageRecipes.push(recipes[i]);
        else break;
    }

    let resBody = { total_recipes: pageRecipes.length, recipes: []};

    pageRecipes.forEach((el) => {
        const ingrs = el.recipe_ingredients?.split(';');
        const ingredients = [];
        let recipe = {};
        recipe.id = el.recipe_id;
        recipe.name = el.recipe_name;
        recipe.instructions = el.recipe_instructions;
        recipe.tags = el.recipe_tags;
        for(const ingr of ingrs) {
            console.log(ingr);
            const ingrString = ingr.split(':');
            console.log(ingrString);
            let ing = new Ingredient(parseInt(ingrString[0]));
            console.log(ing.fetch(db));
            if(!ing.fetch(db)) return new ApiError(403, 'Ingredient not found');
            delete ing.synchronized;
            delete ing.tableName;
            delete ing.__props;
            console.log(ing);
            ingredients.push({ingredient: ing, quantity: ingrString[1]});
        }
        recipe.ingredients = ingredients;

        resBody.recipes.push(recipe);
    });
    return resBody;
}


class ApiRecipeObject extends ApiObject {

    // I think we can have recipes with the same names ? 
    async post(req) {
        console.log("endpoints/recipe: recieved post")

        if(!req.user || req.user.isAdmin != 1) {
            throw new ApiError(401, 'User is not authorized!');
        }

        if(req.params.id == 'all') {
            console.log('Received: recipes/all');
            return allRecipes(req);
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

    async put (req) {
        console.log("endpoints/recipe: recieved put")

        if(!req.user || req.user.isAdmin != 1) {
            throw new ApiError(401, 'User is not authorized!');
        }

        this.enforceContentType(req, 'application/json');
        const data = this.parseAndValidate(req.body, recipePutFormat, true);

        let recipe= new Recipe(data.id);
        recipe.name = data.name;
        recipe.instructions = data.instructions;
        recipe.tags = convertDataTags(data.tags);
        recipe.ingredients = convertDataIngredients(data.ingredients);
        recipe.sync(req.database);
        return true;
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