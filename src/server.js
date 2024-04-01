import express from "express";
import bodyParser from "body-parser"; // thu vien ho tro lay cac tham so phia client su dung cho ta 
import viewEngine from "./config/viewEngine"
import initWebRouters from './route/web'
import connectDB from './config/connectDB';
import cors from 'cors';
require('dotenv').config();


let app = express();
app.use(cors({ origin: true }))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
viewEngine(app);
initWebRouters(app);

connectDB();

let port = process.env.PORT || 6969;
app.listen(port, () => {
    console.log("backend nodejs is running on the port:", port)
});


