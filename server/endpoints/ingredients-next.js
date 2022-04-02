const { data } = require('cheerio/lib/api/attributes');
const { ApiObject, ApiError } = require ('../apiobject.js');
const { Ingredient, validateName, ingredientFormat } = require ('../templates/ingredients.js');
const { User } = require('../templates/user.js');

const ingredientNextFormat = {
    id: {required: true, type: 'number', lambda: () => { return true; }},
    name: { required: false, type: 'string', lambda: validateName }
};


const checkDataUniqueness = (req, ingredientName) => {
    const ingredientsWithSameName = req.database.prepare('SELECT ingredient_id FROM ingredients WHERE ingredient_name = ?').all(ingredientName);
    if(ingredientsWithSameName.length > 0) throw new ApiError(403,'Parameters error: ingredient with the same name already exists.'); //we assume ingredient names are unique
    return true;
}

class ApiIngredientObject extends ApiObject {
    async get(req){
        console.log("endpoints/ingredients/next: recieved get");
        if(!req.user) {
            throw new ApiError(401, 'Not authorized!');
        }

        ////Trying to do it the following way will become overwhelmingly complex if tried on current database structure
        ////especially considering that some SQLite functions like LENGTH() aren't working.
        // const queryPart=[];
        // for(const ingredient of JSON.parse(req.body))
        // {
        //     this.validateFormat(ingredient,ingredientNextFormat,true)
        //     dataArray.push(ingredient);
        //     queryPart.push(`recipe_ingredients LIKE \'%${ingredient.id}:%\'`);
        // }
        // let recipesWithPartialIngredients=req.database.prepare(`SELECT recipe_ingredients as RI FROM recipes WHERE ${queryPart.join(' AND ')} ORDER BY LENGTH(recipe_ingredients) DESC LIMIT 3 `).all();
        //If we find a workaround for the above part and ingredient isn't found, return apierror 404 Ingredient not found.
        
        var ingredients = req.database.prepare(`SELECT * FROM ingredients ORDER BY RANDOM() LIMIT 5;`).all();
        return ingredients;
    }

}

module.exports = ApiIngredientObject;
