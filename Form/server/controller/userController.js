import user from "../model/usermodel.js"

// we add data here with the help of the schema......

const create = async (req, res) => {
    try {
        const newUser = new user(req.body);
        const { email } = newUser;

        const userExist = await user.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: "USer already exist" })
        }
        const saveData = await newUser.save();
        res.status(200).json(saveData)
    }
    catch (err) {
        res.status(500).json({ errorMessage: err.message })
    }
}
const getallUsers = async (req, res) => {
    try {
        const userData = await user.find();
        if (!userData || userData.length == 0) {
            res.status(404).json({ message: "no user data found" });
        }
        res.status(200).json(userData)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
const getuserbyId = async (req, res) => {
    try {
        const id = req.params.id;
        const userExist = await user.findById(id);
        if (!userExist) {
            res.status(404).json({ message: "no user  found" });
        }
        res.status(200).json(userExist)



    } catch (error) {
        res.status(500).json({ error: error.message })

    }
}
const update = async (req, res) => {
    try {
        const id = req.params.id;
        const userExist = await user.findById(id);
        if (!userExist) {
            res.status(404).json({ message: "No such user exist" })
        }


        const updatedData = await user.findByIdAndUpdate(id, req.body, {
            new: true
        })
        res.status(200).json(updatedData)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        const userExist = await user.findById(id);
        if (!userExist) {
            res.status(404).json({ message: "No such user exist" })
        }

        await user.findByIdAndDelete(id);
        res.status(200).json({ message: "User deleted" })



    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


export default { getallUsers, create, getuserbyId, update, deleteUser }