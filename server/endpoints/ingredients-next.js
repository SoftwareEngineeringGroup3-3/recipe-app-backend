const { ApiObject, ApiError } = require ('../apiobject.js');
const { Ingredient, validateName, ingredientFormat } = require ('../templates/ingredients.js');
const { User } = require('../templates/user.js');
const Math = require('mathjs');

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

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
        const page = req.query.page??1;
        const limit = req.query.limit??5;
        let givenIngredientsCount=0;
        let queryPart=[];

        const parsedJson=JSON.parse(req.body)
        try
        {
            let i=0;
            for(let templo of parsedJson)
            {
                break;
            }
        }
        catch(err)
        {
            if (err.code==TypeError.code)
                throw new ApiError(403,"Validation error: probably JSON is not iterable");
        }
        for(const ingredient of parsedJson) //maybe I should've used "in" instead of "of"??? Doesn't seem to trygger exception of not being iterable.
        {
            this.validateFormat(ingredient,ingredientNextFormat,true);
            givenIngredients.push(ingredient.id);
            queryPart.push(`recipe_ingredients LIKE \'%${ingredient.id}:%\'`);
            givenIngredientsCount++;
        }
        if(queryPart.length<1)
        {
            //throw new ApiError(403, "No ingredients selected.")
            queryPart=['1=1 '];
        }

        let recipesIngredientLists=req.database.prepare(
            `SELECT recipe_ingredients as RI FROM recipes 
            WHERE ${queryPart.join(' AND ')} 
            AND (length(recipe_ingredients) - 
                length(replace(recipe_ingredients, ';', '')))>=${givenIngredientsCount}  `).all();
            // ORDER BY random() DESC
            // LIMIT ${limit} OFFSET ${(page-1)*limit} `) //was (page*limit) but now I'm assuming frontend will start sending from page=1
            // .all();
        
        let missingIngredients=[];
        for(let i=0;i<recipesIngredientLists.length;i++)
        {
            missingIngredients=missingIngredients.concat(findMissingIngredients(recipesIngredientLists[i]['RI'],givenIngredients));
        }
        const total_ingredients = missingIngredients.length
        const beginIndex= clamp((page-1)*limit,0,total_ingredients-1 + 99); //was -limit //+99 to let it be out of bounds so we can return empty array upon an invalid page limit combination
        // const endIndex= clamp(page*limit,beginIndex, total_ingredients-1);
        // if(beginIndex>=endIndex)
        // {
        //     endIndex= beginIndex+limit;
        // }
        const ingredients=missingIngredients.splice(beginIndex, limit)//endIndex-beginIndex); //assuming frontend sends page starting from 1 (not 0)
        // const ingredientsToReturn=[];
        // for(let i=0; i<5;i++)
        // {
        //     let index= Math.floor(Math.random() * ((missingIngredients.length-1)+ 1));
        //     if(!missingIngredients[index]=="" && !ingredientsToReturn.includes(missingIngredients[index])) //avoids duplicates
        //     {
        //         ingredientsToReturn.push(missingIngredients[index]);
        //     }
        // }

        // if(ingredientsToReturn.length == 0)
        if(ingredients.length==0)
        {
            throw new ApiError(404, "No suitable ingredients were found.");
        }

        // return ingredientsToReturn;
        return {total_ingredients, ingredients};
    }

}

module.exports = ApiIngredientObject;