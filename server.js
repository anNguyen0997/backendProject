const { query } = require('express');
const express = require('express');
const app = express();
const { Sequelize } = require('sequelize');
const { users,stats,index } = require('./models')
const sequelize = new Sequelize('postgres://postgres:testing1234xA@localhost:5432/wes_database')
app.use(express.json())

//hello