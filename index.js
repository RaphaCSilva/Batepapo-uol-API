import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import chalk from 'chalk';

const app = express();
dotenv.config();




const porta = 5000;
app.listen(porta, ()=> {
    console.log(chalk.bold.blue('servidor de pé na porta ' + porta));
})