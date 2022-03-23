const { ApiObject, ApiError } = require ('../apiobject.js');
const { Ingredient, validateName, ingredientFormat } = require ('../templates/ingredients.js');
//const { verifyToken } = require ('../templates/token.js'); //Don't know if this is needed for user type (admin or normal user) validation

const ingredientPostFormat = {
    id: {required: false, type: 'number', lambda: () => { return true; }},
    name: { required: true, type: 'string', lambda: validateName }
};


const ingredientFetchFormat = {
    id: {required: true, type: 'number', lambda: () => { return true; }},
}

const ingredientPutFormat = {
    id: {required: true, type: 'number', lambda: () => { return true; }},
    name: { required: false, type: 'string', lambda: validateName }
};


const checkDataUniqueness = (req, ingredientName) => {
    const ingredientsWithSameName = req.database.prepare('SELECT ingredient_id FROM ingredients WHERE ingredient_name = ?').all(ingredientName);
    if(ingredientsWithSameName.length > 0) throw new ApiError(403,'Parameters error: ingredient with the same name already exists.'); //we assume ingredient names are unique
    return true;
}

class ApiIngredientObject extends ApiObject {
    async post (req) {
        console.log("endpoints/ingredients: recieved post")
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
      
        this.enforceContentType(req, 'application/json');
        const data=this.parseAndValidate(req.body,ingredientFetchFormat, true);

        let ingred= new Ingredient(data.id);
        if(!ingred.fetch(req.database)) //fetch, when succesful, populates the other fields of the ingredient apart from the id.
        {
            throw new ApiError(404, 'Ingredient not found')
        }
        ingred.delete(req.database);
        return ingred.serialize();
    }

    async put(req){
        console.log("endpoints/ingredients: recieved put");

        this.enforceContentType(req,'application/json');
        const data=this.parseAndValidate(req.body,ingredientPutFormat, true);

        let oldIngredient = new Ingredient(data.id);
        if(!oldIngredient.fetch(req.database)) //fetch returns false if id doesn't exist or true if it does.
        {
            throw new ApiError(404, 'Ingredient not found')
        }

        // if(typeof data.photo == undefined)
        //     throw new ApiError(200,"success lol");
        
        if(data.name!=null) //These ifs check if the packet didn't cotain the given field (i.e. doesn't need to be updated)
        {
            oldIngredient.name=data.name;
        }
        oldIngredient.sync(req.database);

        return oldIngredient.serialize();
    }

    async get(req){
        console.log("endpoints/ingredients: recieved get");
        var ingredients = req.database.prepare("Select ingredient_id as id, ingredient_name as name from ingredients").all();
        return ingredients;
    }

}

module.exports = ApiIngredientObject;