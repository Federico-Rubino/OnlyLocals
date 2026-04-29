const express = require('express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const userRoutes = require('./routes/routesUser');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();


app.use(express.json());

// routes
app.use('/api/users', userRoutes);


//swagger api ui
const swaggerOptions = {
    definition: {
        openapi: '3.0.0'
        ,
        info: {
            title: 'Hello World'
            ,
            version: '1.0.0'
            ,
        },
    },
    apis: [__dirname + '/routes/*.js'], // files containing annotations as above
};

const swaggerDocument = swaggerJsDoc(swaggerOptions);
app.use('/api-docs',swaggerUi.serve, swaggerUi.setup(swaggerDocument));
console.log(swaggerOptions.apis);

// error handler (sempre alla fine)
app.use(errorMiddleware);

module.exports = app;