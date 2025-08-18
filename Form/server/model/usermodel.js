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

export default mongoos.model("users", userSchema);