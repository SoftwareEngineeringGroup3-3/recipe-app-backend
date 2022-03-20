class DatabaseObject {
    constructor (tableName, id=null, synchronized=false) {
        this.id = id;
        this.synchronized = synchronized;
        this.tableName = tableName;
        this.__props = { };
    }

    //Binding Object properties to corresponding columns' names in the database
    bindProperty (propertyName, databaseColumn, defaultValue = null) {
        this.__props[propertyName] = databaseColumn;
        this[propertyName] = defaultValue;
    }

    //inserting Object to the given database
    insert (database) {
        if(!this.synchronized) {
            const assignments = [], values = [];

            for(const classProperty in this.__props) {
                const dbProperty = this.__props[classProperty];

                assignments.push(dbProperty);
                values.push(this[classProperty]);
            }

            const query = `INSERT INTO ${this.tableName} (${assignments.join(',')}) VALUES (${'?, '.repeat(assignments.length-1)+'?'})`;
            const res = database.prepare(query).run(...values);

            this.id = res.lastInsertRowid;
            this.synchronized = true;
        } else {
            throw new Error ('Unable to insert object that is already synchronised (present in the database)');
        }
    }

    //updating Object in the given database
    sync (database) {
        if(this.synchronized) {
            const idColumnName = this.__props['id'];
            const assignments = [], values = [];

            for(const classProperty in this.__props) {
                const dbProperty = this.__props[classProperty];

                assignments.push(`${dbProperty} = ?`);
                values.push(this[classProperty]);
            }

            const query = `UPDATE ${this.tableName} SET ${assignments.join(', ')} WHERE ${idColumnName} = ?`;
            database.prepare(query).run(...values, this.id);
        } else {
            throw new Error ('Object not in the database');
        }
    }

    //retrieve info about an Object based on its ID
    fetch (database) {
        if(this.id !== null && this.id !== undefined) {
            const idColumnName = this.__props['id'];

            if(!idColumnName) throw new Error(`ID column was not bound for ${this.tableName}`);

            const query = `SELECT ${Object.values(this.__props).join(', ')} FROM ${this.tableName} WHERE ${idColumnName} = ?`;
            const row = database.prepare(query).get(this.id);

            if(!row) return false;

            for(const classProperty in this.__props) {
                const dbProperty = this.__props[classProperty];
                this[classProperty] = row[dbProperty];
            }

            return true;
        } else {
            throw new Error('Cannot fetch an Object without giving its ID');
        }
    }

    //delete Object from table based on its ID
    delete (database) {
        if(this.synchronized) {
            const idColumnName = this.__props['id'];
            const query = `DELETE FROM ${this.tableName} WHERE ${idColumnName} = ?`;

            database.prepare(query).run(this.id);
        }
    }

    //serialize Object
    serialize () {
        const serialized = {};

        for(const classProperty in this.__props) {
            const dbProperty = this.__props[classProperty];
            serialized[dbProperty] = this[classProperty];
        }

        return serialized;
    }
}

class JointDatabaseObject extends DatabaseObject {
    constructor (tableName, id = null, synchronized = false) {
        super(tableName, id, synchronized); //calling parent constructor
        this.__extProps = { };
    }

    bindExternalProperty(propertyName, databaseColumn, defaultValue = null) {
        this.__extProps[propertyName] = databaseColumn;
        this[propertyName] = defaultValue;
    }

    getFetchTable () {
        return this.tableName;
    }

    fetch (database) {
        if(this.id !== null && this.id !== undefined) {
            const idColumnName = this.__props['id'];
            if (!idColumnName) {
                throw new Error (`id column was not bound for ${this.tableName}`);
            }

            const fields = Object.values(this.__props).concat(Object.values(this.__extProps));
            const query = `SELECT ${fields.join(', ')} FROM ${this.getFetchTable()} WHERE ${idColumnName} = ?`;
            const row = db.prepare(query).get(this.id);

            if(!row) return false;

            for(const classProperty in this.__props) {
                const dbProperty = this.__props[classProperty];
                this[classProperty] = row[dbProperty];
            }

            for (const extClassProperty in this.__extProps) {
                const dbProperty = this.__extProps[extClassProperty];
                this[extClassProperty] = row[dbProperty];
            }

            return true;
        } else {
            throw new Error ('Cannot fetch an Object without giving its ID');
        }
    }

    serialize () {
        const serialized = super.serialize();

        for(const extClassProperty in this.__extProps) {
            const dbProperty = this.__extProps[extClassProperty];
            serialized[dbProperty] = this[extClassProperty];
        }

        return serialized;
    }
}


module.exports.DatabaseObject = DatabaseObject;
module.exports.JointDatabaseObject = JointDatabaseObject;