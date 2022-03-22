const { ApiObject, ApiError } = require ('../apiobject.js');
const { Ingredient, validateName, ingredientFormat } = require ('../templates/ingredients.js');
const { User } = require('../templates/user.js');

const ingredientPostFormat = {
    id: {required: false, type: 'number', lambda: () => { return true; }},
    name: { required: true, type: 'string', lambda: validateName },
    photo: { required: false, type: 'string',lambda: () => { return true; }}
};


const ingredientFetchFormat = {
    id: {required: true, type: 'number', lambda: () => { return true; }},
}

const ingredientPutFormat = {
    id: {required: true, type: 'number', lambda: () => { return true; }},
    name: { required: false, type: 'string', lambda: validateName },
    photo: { required: false, type: 'string',lambda: () => { return true; }}
};

const checkDataUniqueness = (req, ingredientName) => {
    const ingredientsWithSameName = req.database.prepare('SELECT ingredient_id FROM ingredients WHERE ingredient_name = ?').all(ingredientName);
    if(ingredientsWithSameName.length > 0) throw new ApiError(403,'Parameters error: ingredient with the same name already exists.'); //we assume ingredient names are unique
    return true;
}

const checkAdminCredentials = (req) =>{
    if((typeof req.user)== 'undefined' || req.user.isAdmin!=1) //make sure to require user.js if you try to access req.user
    {
        throw new ApiError(401, "Error: User not authorized");
    }
    return true;
}

const checkBasicAuth = (req) =>{
    if((typeof req.user) == 'undefined')
    {
        throw new ApiError(401, "Error: User not authorized");
    }
    return true;
}

class ApiIngredientObject extends ApiObject {
    async post (req) {
        checkAdminCredentials(req);
        console.log("endpoints/ingredients: recieved post")
        this.enforceContentType(req, 'application/json');
        const data = this.parseAndValidate(req.body, ingredientPostFormat, true);
        checkDataUniqueness(req,data.name);
        let ingredient = new Ingredient();
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
        checkAdminCredentials(req);
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
        checkAdminCredentials(req);
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
        if(data.photo!=null)
        {
            oldIngredient.photo=data.photo;
        }
        oldIngredient.sync(req.database);

        return oldIngredient.serialize();
    }
}

module.exports = ApiIngredientObject;