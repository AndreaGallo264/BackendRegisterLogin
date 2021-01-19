const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

//Connect to DB
mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true }).then(
    () => {
        /** ready to use. The `mongoose.connect()` promise resolves to mongoose instance. */
        console.log('connected to DB');
    },
    err => { /** handle initial connection error */
        console.log(err);
    }
);

/* Express parser to decodify req */
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Import routes
const authRoute = require('./routes/auth.js');
const postRoute = require('./routes/posts.js');


// Routes middlewares
app.use('/api/user', authRoute);
app.use('/api/posts', postRoute);

app.listen(8080, () => console.log('server up and running'));