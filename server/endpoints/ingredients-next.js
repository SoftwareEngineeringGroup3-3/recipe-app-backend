const { ApiObject, ApiError } = require ('../apiobject.js');
const { Ingredient, validateName, ingredientFormat } = require ('../templates/ingredients.js');
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

const findMissingIngredients = (stringIngred, givenIngredients) =>{ //or ingredientLists if I want to do nested for loops.
    let ingredCount=countIngredients(stringIngred);
    let string='';
    string=stringIngred.replace(/:.*;/,';');
    string=string.replace(/:.*/,''); //handles the last ingredient because that doesn't always have ';'

    const missingIngreds=[];
    let strIngredArr=string.split(';');
    for(let i=0; i<strIngredArr.length; i++){
        if(!givenIngredients.includes(Number(strIngredArr[i])))
        {
            missingIngreds.push(strIngredArr[i]);
        }
    }
    return missingIngreds;
}
class ApiIngredientObject extends ApiObject {
    async get(req){
        console.log("endpoints/ingredients/next: recieved get");
        if(!req.user) {
            throw new ApiError(401, 'User is not authorized!');
        }

        const givenIngredients =[];
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
            `SELECT recipe_ingredients as RI FROM recipes WHERE ${queryPart.join(' AND ')}
            ORDER BY length(recipe_ingredients) DESC LIMIT 10 `)
            .all();

        let missingIngredients=[];
        for(let i=0;i<recipesIngredientLists.length;i++)
        {
            missingIngredients=missingIngredients.concat(findMissingIngredients(recipesIngredientLists[i]['RI'],givenIngredients))
        }

        const ingredientsToReturn=[];
        for(let i=0; i<5;i++)
        {
            let index= Math.floor(Math.random() * ((missingIngredients.length-1)+ 1));
            if(!missingIngredients[index]=="" && !ingredientsToReturn.includes(missingIngredients[index])) //avoids duplicates
            {
                ingredientsToReturn.push(missingIngredients[index]);
            }
        }

        if(ingredientsToReturn.length == 0)
        {
            throw new ApiError(404, "No suitable ingredients were found.");
        }

        return ingredientsToReturn;
    }

}

module.exports = ApiIngredientObject;