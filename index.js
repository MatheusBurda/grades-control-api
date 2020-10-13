import express from "express";
import gradesUpdater from "./routes/grades.js"

global.gradesJSON = "./data/grades.json";

const app = express();
app.use(express.json());
app.use("/", gradesUpdater);

app.listen(3000, ()=>{
    console.log("grades-control-api Running!");
});