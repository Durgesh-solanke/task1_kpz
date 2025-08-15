import mongoose from "mongoose";
import express from "express"
import bodyParser from "body-parser";
const app = express();
import cors from "cors"

app.use(cors())


app.use(bodyParser.json())

mongoose.connect("mongodb://localhost:27017/form_full")
    .then(() => {
        console.log("connection success")
    })
    .catch((err) => {
        console.log(err)
    })



import route from "./routes/userRoutes.js";
app.use('/api', route);

app.listen(5000, () => {
    console.log("server is on 5000")
})