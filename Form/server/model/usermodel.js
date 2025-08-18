import mongoos from "mongoose";

const userSchema = mongoos.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    // mark: {
    //     type: Number,    
    //     required: true
    // }
})

const UserSchemaKPZ = mongoos.Schema({
    Speed: {
        type: Number,
        required: true
    },
    TWX: {
        type: Number,
        required: true
    },
    TWY: {
        type: Number,
        required: true
    },
    TWZ: {
        type: Number,
        required: true
    },

})

// export default mongoos.model("users", userSchema);
export default mongoos.model("usersKPZ", UserSchemaKPZ);