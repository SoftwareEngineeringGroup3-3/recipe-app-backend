const { ApiObject, ApiError } = require ('../apiobject.js');
const { Ingredient, validateName, ingredientFormat } = require ('../templates/ingredients.js');
//const { verifyToken } = require ('../templates/token.js'); //Don't know if this is needed for user type validation

const ingredientClassFormat = {
    id: {required: false, type: 'integer'},
    name: { required: true, type: 'string', lambda: validateName },
    photo: { required: false, type: 'string'}
};

class ApiIngredientObject extends ApiObject {
    async post (req) {
        this.enforceContentType(req, 'application/json');
        const data = this.parseAndValidate(req.body, ingredientClassFormat, true);
        if(!validateName(data.name))
        {
            throw new ApiError(403,'Validation exception: Incorrect or missing ingredient name.')
        }
        var ingredient = new Ingredient();
        ingredient.id=data.id; //Is this line needed? The API specificatio`n seems to suggest so, yet so it did for Registration but we removed this line from that.
        ingredient.name=data.name;
        ingredient.photo=data.photo;
        Console.log(ingredient.serialize());
        ingredient.insert();
        if(!ingredient.id)
        {
            throw new ApiError(403, 'Recipe creation failed');
        }
        ingredient=ingredient.serialize();
        return ingredient;
    }
}

module.exports = ApiIngredientObject;