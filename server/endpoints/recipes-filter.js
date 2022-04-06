const { data } = require('cheerio/lib/api/attributes');
const { ApiObject, ApiError } = require ('../apiobject.js');
const { Ingredient, validateName, ingredientFormat } = require ('../templates/ingredients.js');
const { Recipe } = require('../templates/recipes.js');
const { User } = require('../templates/user.js');

const ingredientNextFormat = {
    id: {required: true, type: 'number', lambda: () => { return true; }},
    name: { required: false, type: 'string', lambda: validateName }
};



const countIngredients = (ingredientList) =>{
    let count = 0;
    let string=ingredientList;
    for(let i = 0; i < string.length; i++){
       if(string.charAt(i)===':')
       {
           count++;
       }
    };
    return count;
}



class ApiRecipeFilterObject extends ApiObject {
    async post(req){
        console.log("endpoints/recipes/filter: recieved get");
        
        // if(!req.params.page)
        // {
        //     throw new ApiError(403,"Validation error.")
        // }
        // const page=req.params.page;
        const page=1;
        const offset=page-1;
        // if(!req.user) {
        //     throw new ApiError(401, 'User is not authorized!');
        // }

        const givenIngredients = [];
        let givenIngredientsCount=0;
        const queryPart=[];
        for(const ingredient of JSON.parse(req.body))
        {
            this.validateFormat(ingredient,ingredientNextFormat,true)
            givenIngredients.push(ingredient.id);
            queryPart.push(`recipe_ingredients LIKE \'%${ingredient.id}:%\'`);
            givenIngredientsCount++;
        }
        if(queryPart.length==0)
        {
            throw new ApiError(403, "No ingredients selected.")
        }
        let recipesIngredientLists=req.database.prepare(
            `SELECT recipe_id as id, recipe_ingredients as RI FROM recipes WHERE ${queryPart.join(' AND ')}
            ORDER BY length(recipe_ingredients) ASC limit 10 offset ${offset}`)
            .all();

        let recipesFiltered=[];
        for(let i=0;i<recipesIngredientLists.length;i++)
        {
            if(countIngredients(recipesIngredientLists[i]['RI'])==givenIngredients.length)
            {
                let currRecipe = new Recipe(recipesIngredientLists[i]['id']);
                currRecipe.fetch(req.database);
                recipesFiltered.push(currRecipe.serialize());
            }
        }

        if(recipesFiltered.length == 0)
        {
            throw new ApiError(404, "No suitable recipes were found.");
        }

        return recipesFiltered;
    }

}

module.exports = ApiRecipeFilterObject;