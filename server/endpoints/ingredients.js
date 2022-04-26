const { ApiObject, ApiError } = require ('../apiobject.js');
const { Ingredient, validateName, ingredientFormat } = require ('../templates/ingredients.js');
const { User } = require('../templates/user.js');

const ingredientPostFormat = {
    name: { required: true, type: 'string', lambda: validateName }
};


const ingredientFetchFormat = {
    id: {required: true, type: 'number', lambda: () => { return true; }},
}

const ingredientPutFormat = {
    id: {required: false, type: 'number', lambda: () => { return true; }},
    name: { required: true, type: 'string', lambda: validateName }
};


const checkDataUniqueness = (req, ingredientName) => {
    const ingredientsWithSameName = req.database.prepare('SELECT ingredient_id FROM ingredients WHERE ingredient_name = ?').all(ingredientName);
    if(ingredientsWithSameName.length > 0) throw new ApiError(403,'Parameters error: ingredient with the same name already exists.'); //we assume ingredient names are unique
    return true;
}

class ApiIngredientObject extends ApiObject {
    async post (req) {
        console.log("endpoints/ingredients: recieved post")

        if(!req.user || req.user.isAdmin != 1) {
            throw new ApiError(401, 'User is not authorized!');
        }

        if(req.params.id == 'all') {
            console.log('Received: ingredients/all');
            const page = req.query.page;
            const limit = req.query.limit;
            const ingredients = req.database.prepare("SELECT ingredient_id AS id, ingredient_name AS name FROM ingredients").all();
            let pageIngredients = [];
            for(let i = (page-1) * limit; i < page*limit; i++) {
                if(ingredients[i] != null) pageIngredients.push(ingredients[i]);
                else break;
            }

            return pageIngredients;
        }

        this.enforceContentType(req, 'application/json');
        const data = this.parseAndValidate(req.body, ingredientPostFormat, true);
        checkDataUniqueness(req,data.name);
        let ingredient = new Ingredient();
        ingredient.name=data.name;
        ingredient.insert(req.database);
        if(!ingredient.id)
        {
            throw new Error('Ingredient creation failed');
        }
        ingredient=ingredient.serialize();
        return ingredient;
    }

    async delete(req){
        console.log("endpoints/ingredients: recieved delete")

        if(!req.user || req.user.isAdmin != 1) {
            throw new ApiError(401, 'User is not authorized!');
        }
        if(!req.params.id)
        {
             throw new ApiError(403, 'Validation exception.');
        }
        //this.enforceContentType(req, 'application/json');
        // const data=this.parseAndValidate(req.body,null, true);

        let ingred= new Ingredient(req.params.id);
        if(!ingred.fetch(req.database)) //fetch, when succesful, populates the other fields of the ingredient apart from the id.
        {
            throw new ApiError(404, 'Ingredient not found')
        }
        ingred.delete(req.database);
        return ingred.serialize();
    }

    async put(req){
        console.log("endpoints/ingredients: recieved put");

        if(!req.user || req.user.isAdmin != 1) {
            throw new ApiError(401, 'User is not authorized!');
        }
        if(!req.params.id)
        {
             throw new ApiError(403, 'Validation exception.');
        }
        this.enforceContentType(req,'application/json');
        const data=this.parseAndValidate(req.body,ingredientPutFormat, true);

        let oldIngredient = new Ingredient(req.params.id);
        if(!oldIngredient.fetch(req.database)) //fetch returns false if id doesn't exist or true if it does.
        {
            throw new ApiError(404, 'Ingredient not found')
        }
        
        oldIngredient.name=data.name;
        oldIngredient.sync(req.database);

        return oldIngredient.serialize();
    }
}

module.exports = ApiIngredientObject;