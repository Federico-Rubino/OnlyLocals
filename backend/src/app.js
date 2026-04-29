const express = require('express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const routesUser = require('./routes/routesUser');


const app = express();


app.use(express.json());

// routes
app.use('/api/users', routesUser);


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



module.exports = app;