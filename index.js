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
            time: dayjs().format('HH:mm:ss')
        })

        res.sendStatus(201);


    } catch (e) {
        console.log(e);
        return res.send("Erro ao registrar");
    }

});

app.get("/participants", async (req,res) => {
    try {
        const participantes = await db.collection("participantes").find().toArray();
        res.send(participantes);
    } catch (e) {
        console.log(e);
        return res.send("Erro ao obter participantes");
    }
});

app.post("/messages", async(req, res) => {
    const mensagem = req.body;
    const usuario = req.headers.user;
    const mensagemSchema = joi.object({
        to: joi.string().required(),
        text: joi.string().required(),
        type: joi.string().valid('private_message', 'message').required()
    });
    const {error} = mensagemSchema.validate(mensagem, {abortEarly: false});
    if(error){
        console.log(error);
        return res.sendStatus(422);
    }

    try {
        const participante = await db.collection("participantes").findOne({name: usuario});
        if(!participante){
            return res.sendStatus(422);
        }

        await db.collection("mensagens").insertOne({
            from: usuario,
            to: mensagem.to,
            text: mensagem.text,
            type: mensagem.type,
            time: dayjs().format('HH:mm:ss')
        });

        res.sendStatus(201);

    } catch (e) {
        console.log(e);
        return res.send("Erro ao consultar a lista de participantes");
    }

});

app.get("/messages", async (req, res) => {
    const limite = parseInt(req.query.limit);
    const usuario = req.headers.user;
    
    try {
        const mensagens = await db.collection("mensagens").find().toArray();
        const mensagens_filtradas = mensagens.filter( mensagem => {
          const para_ou_dele =  mensagem.to === usuario || mensagem.from === usuario || mensagem.to === "todos";
          const publica = mensagem.type === "message";
          
          return para_ou_dele || publica;
        });

        if(limite > 0){
           return res.send(mensagens_filtradas.slice(-limite));
        }

        res.send(mensagens_filtradas);

    } catch (e) {
        console.log(e);
        res.send("Erro ao consultar as mensagens");
    }

});

const porta = 5000;
app.listen(porta, ()=> {
    console.log(chalk.bold.blue('servidor de pé na porta ' + porta));
})