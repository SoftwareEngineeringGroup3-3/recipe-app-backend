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
    console.log(string=stringIngred.replace(/:.*;/,';'));
    console.log(string=string.replace(/:.*/,'')); //handles the last ingredient because that doesn't always have ';'

    const missingIngreds=[];
    let strIngredArr=string.split(';');
    for(let i=0; i<strIngredArr.length; i++){
        if(!givenIngredients.includes(Number(strIngredArr[i])))
        {
            console.log(strIngredArr[i]);
            missingIngreds.push(strIngredArr[i]);
        }
    }
    return missingIngreds;
}
class ApiIngredientObject extends ApiObject {
    async get(req){
        console.log("endpoints/ingredients/next: recieved get");
        // if(!req.user) {
        //     throw new ApiError(401, 'User is not authorized!');
        // }

        ////Trying to do it the following way will become overwhelmingly complex if tried on current database structure
        ////especially considering that some SQLite functions like LENGTH() aren't working.
        const dataArray =[];
        let givenIngredientsCount=0;
        const queryPart=[];
        for(const ingredient of JSON.parse(req.body))
        {
            this.validateFormat(ingredient,ingredientNextFormat,true)
            console.log(typeof ingredient.id)
            dataArray.push(ingredient.id);
            queryPart.push(`recipe_ingredients LIKE \'%${ingredient.id}:%\'`);
            givenIngredientsCount++;
        }
        const ingredientsListArray=[];
        let recipesIngredientLists=req.database.prepare(`SELECT recipe_ingredients as RI FROM recipes WHERE ${queryPart.join(' AND ')} ORDER BY length(recipe_ingredients) DESC LIMIT 3 `).all(
            // function(err,rows){
            //     rows.forEach((row) => {
            //         console.log(row.RI);
            //     })
            // }
        );
        console.log(recipesIngredientLists.length);
        console.log(recipesIngredientLists[0]);
        console.log(countIngredients(recipesIngredientLists[0]['RI']));
        //let topRecipeIngredientCount=recipesWithPartialIngredients.//req.database.prepare('SELECT LEN(col) - LEN(REPLACE(col, 'Y', ''))')
        //If we find a workaround for the above part and ingredient isn't found, return apierror 404 Ingredient not found.
        
        // var ingredients = req.database.prepare(`SELECT * FROM ingredients ORDER BY RANDOM() LIMIT 5;`).all();
        // return ingredients;
        return findMissingIngredients(recipesIngredientLists[0]['RI'],dataArray);
    }

}

module.exports = ApiIngredientObject;