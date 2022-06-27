import express, {json} from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import chalk from 'chalk';

dotenv.config();

const app = express();
app.use(cors());
app.use(json());

let db;
const mongoClient = new MongoClient("mongodb://localhost:27017");
const promise = mongoClient.connect();
promise.then(() => {
  db = mongoClient.db("bate-papo-uol");
  console.log("conectou no banco");
});
promise.catch((e) => console.log("erro na conexão com o banco", e))

const porta = 5000;
app.listen(porta, ()=> {
    console.log(chalk.bold.blue('servidor de pé na porta ' + porta));
})