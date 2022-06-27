import express, {json} from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import chalk from 'chalk';
import dayjs from "dayjs";
import joi from "joi";

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

app.post("/participants", async (req, res) => {
    const participante = req.body; //{name: "joão"}
    const participanteSchema = joi.object({
        name: joi.string().required()
    });
    const {error} = participanteSchema.validate(participante, { abortEarly: false });
    if(error){
        console.log(error);
        return res.sendStatus(422);
    }
    
    try {
        const userJaExiste = await db.collection("participantes").findOne({name: participante.name});
        if(userJaExiste){
            return res.sendStatus(409);
        }
        await db.collection("participantes").insertOne({name: participante.name, lastStatus: Date.now()})
        await db.collection("mensagens").insertOne({
            from: participante.name,
            to: 'Todos',
            text: 'entra na sala ...',
            type: 'status',
            time: dayjs().format('HH:MM:SS')
        })

        res.sendStatus(201);


    } catch (e) {
        console.log(e);
        return res.send("Erro ao registrar");
    }

});




const porta = 5000;
app.listen(porta, ()=> {
    console.log(chalk.bold.blue('servidor de pé na porta ' + porta));
})