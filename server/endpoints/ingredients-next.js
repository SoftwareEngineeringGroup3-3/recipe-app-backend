const { ApiObject, ApiError } = require ('../apiobject.js');
const { Ingredient, validateName, ingredientFormat } = require ('../templates/ingredients.js');
const { User } = require('../templates/user.js');

// const clamp = (num, min, max) => (num>min?num:min)<max?num:max;

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
    stringIngred=stringIngred.replaceAll(/\s/g, "");
    // console.log(stringIngred)
    string=stringIngred.replaceAll(/:.*?;/g,';');
    // console.log(string)
    string=string.replaceAll(/:.*/g,''); //handles the last ingredient because that doesn't always have ';'
    // console.log(string)
    const missingIngreds=[];
    let strIngredArr=string.split(';');
    // console.log(strIngredArr)
    for(let i=0; i<strIngredArr.length; i++){
        if(strIngredArr[i].trim()=="")
            continue;
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

        
        
        var parsedJson=undefined
        if(!req.body||Object.keys(req.body).length === 0)
        {

        }
        else
        {
            parsedJson=JSON.parse(req.body)
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
        // console.log(typeof(missingIngredients)+" : "+missingIngredients)
        let ingredients=[]
        let ingredientIdsAlreadyAdded=[]
        let count=0
        // console.log(missingIngredients)
        for(let i=0;i<missingIngredients.length;i++)
        {
            count++;
            if(ingredientIdsAlreadyAdded.includes(missingIngredients[i]))
            {
                // console.log(ingredientIdsAlreadyAdded)
                // console.log(missingIngredients[i])
                count--;
                continue;
            }
            ingredientIdsAlreadyAdded.push(missingIngredients[i])
            let currIngred=new Ingredient(missingIngredients[i]);
            currIngred.fetch(req.database);
            delete currIngred.synchronized;
            delete currIngred.__props;
            delete currIngred.tableName;
            ingredients.push(currIngred);
        }

        const total_ingredients = count
        let beginIndex =(page-1)*limit;
        const min=0; const max=total_ingredients-1 + 99;
        beginIndex=beginIndex>min?beginIndex:min;
        beginIndex=beginIndex<max?beginIndex:max;

        missingIngredients=missingIngredients.splice(beginIndex, limit)//endIndex-beginIndex); //assuming frontend sends page starting from 1 (not 0)

        if(ingredients.length==0)
        {
            throw new ApiError(404, "No suitable ingredients were found.");
        }

        return {total_ingredients, ingredients};
    }

}

module.exports = ApiIngredientObject;