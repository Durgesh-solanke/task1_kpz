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
    // password: {
    //     type: String,
    //     required: true
    // }
})

export default mongoos.model("users", userSchema);