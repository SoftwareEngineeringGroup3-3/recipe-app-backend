const { ApiObject, ApiError } = require ('../apiobject.js');
const { Ingredient, validateName, ingredientFormat } = require ('../templates/ingredients.js');
//const { verifyToken } = require ('../templates/token.js'); //Don't know if this is needed for user type (admin or normal user) validation

const ingredientClassFormat = {
    id: {required: false, type: 'number', lambda: () => { return true; }},
    name: { required: true, type: 'string', lambda: validateName },
    photo: { required: false, type: 'string',lambda: () => { return true; }}
};


const ingredientFetchFormat = {
    id: {required: true, type: 'number', lambda: () => { return true; }},
}

const checkDataUniqueness = (req, ingredientName) => {
    const ingredientsWithSameName = req.database.prepare('SELECT ingredient_id FROM ingredients WHERE ingredient_name = ?').all(ingredientName);
    if(ingredientsWithSameName.length > 0) throw new ApiError(403,'Parameters error: ingredient with the same name already exists.'); //we assume ingredient names are unique
    return true;
}
class ApiIngredientObject extends ApiObject {
    async post (req) {
        console.log("endpoints/ingredients: recieved post")
        this.enforceContentType(req, 'application/json');
        const data = this.parseAndValidate(req.body, ingredientClassFormat, true);
        checkDataUniqueness(req,data.name);
        var ingredient = new Ingredient();
        //ingredient.id=data.id; //Is this line needed? The API specification seems to suggest so, yet so it did for Registration but we removed this line from that.
        ingredient.name=data.name;
        ingredient.photo=data.photo;
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

        var ingred= new Ingredient(data.id);
        if(!ingred.fetch(req.database)) //fetch, when succesful, populates the other fields of the ingredient apart from the id.
        {
            throw new ApiError(404, 'Ingredient not found')
        }
        ingred.delete(req.database);
        return ingred.serialize();
    }
}

module.exports = ApiIngredientObject;