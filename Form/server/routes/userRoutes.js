import userController from "../controller/userController.js";
import express from "express";
const route = express.Router();

route.post('/user', userController.create);
route.get("/users", userController.getallUsers)
route.get('/user/:id', userController.getuserbyId)
route.put("/user/update/:id", userController.update)
route.delete("/user/delete/:id", userController.deleteUser)

export default route;