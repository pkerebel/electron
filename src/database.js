const mongoose = require('mongoose')


mongoose.connect('mongodb+srv://abitbol:Abitbol123@cluster0.cjfhm.mongodb.net/TutoNodeJs?retryWrites=true&w=majority',
    {
        dbName: process.env.DB_NAME,
        user: process.env.DB_USER,
        pass: process.env.DB_PASS,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(db => console.log('Connection OK'))
    .catch(err => console.log('Echec connexion'))