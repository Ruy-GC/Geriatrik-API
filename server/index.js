
// server-index.js
const express = require("express");

//middleware to protect request
const auth = require('../middleware/auth');

const PORT = process.env.PORT || 3001;

const fs = require("fs");
const bp = require("body-parser");
const path = require("path");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

var mysql = require("mysql");
const { param } = require("express/lib/request");

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "geriatrik",
  port: 3306
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Geriatrik database connection succesful!");
});

getPatients = function () {
  return new Promise(function (resolve, reject) {
    con.query("SELECT * FROM paciente", function (err, rows, fields) {
      if (err) throw err;
      results = Object.values(JSON.parse(JSON.stringify(rows)));
      resolve(results);
    });
  });
};

getPatient = function (id) {
  return new Promise(function (resolve, reject) {
    con.query("SELECT * FROM paciente WHERE pacienteID = " + id, function (err, rows) {
      if (err) throw err;
      var results = Object.values(JSON.parse(JSON.stringify(rows)));
      console.log(results)
      resolve(results);
    });
  });
};

getProfile = function (id) {
  return new Promise(function (resolve, reject) {
    con.query("SELECT * FROM empleado WHERE empleadoID = " + id, function (err, rows) {
      if (err) throw err;
      var results = Object.values(JSON.parse(JSON.stringify(rows)));
      console.log(results)
      resolve(results);
    });
  });
};

addPatient = function (
  name, lastName, motherLastName, birthday, gender, scholarity, disabilities, memoryComplaint, severeHearingLoss, emergencyContact, image
) {
  return new Promise(function (resolve, reject) {
    con.query(
      "INSERT INTO paciente (nombre, apellidoP, apellidoM, fechaNac, sexo, escolaridad, discapacidades, queja_memoria, hipoacusia_severa, contactoEmergencia, imagenPerfil) VALUES ('" +
        name +"', '"+
        lastName +"', '"+
        motherLastName +"', '"+
        birthday +"', '"+
        gender +"', '"+
        scholarity +"', '"+
        disabilities +"', "+
        memoryComplaint +", "+
        severeHearingLoss +", '"+
        emergencyContact +"', '"+
        image +
        "')",
      function (err, rows, fields) {
        if (err) throw err;
        results = Object.values(JSON.parse(JSON.stringify(rows)));
        resolve(results);
      }
    );
  });
};

addEmployee = function (nombre, apellidoP,apellidoM,fechaNac,tipo,sexo,cedula,email,cont,pfp){
  return new Promise(function (resolve, reject) {
    con.query("INSERT INTO empleado (nombre,apellidoP,apellidoM,fechaNac,tipoEmpleado,sexo,cedula,email,password,imagenPerfil)"+
      "SELECT * FROM (SELECT '"+
      nombre+"', '"+
      apellidoP+"', '"+
      apellidoM+"', '"+
      fechaNac+"', "+
      tipo+", '"+
      sexo+"', '"+
      cedula+"', '"+
      email+"', '"+
      cont+"','"+pfp+"')"+
      "as tmp WHERE NOT EXISTS ( SELECT email FROM empleado WHERE email = '" +email+ "') LIMIT 1",
      function (err, results) {
        if (err) throw err;
        resolve(results);
      }
    )
  });
};

getUser = function (email){
  return new Promise(function (resolve, reject) {
    con.query("SELECT empleadoID, nombre, cedula,password FROM empleado WHERE email = '"+ email+"';",
      function (err, results) {
        if (err) throw err;
        resolve(results);
      }
    )
  });
};

getTamizaje = function (pacienteID){
  return new Promise(function (resolve, reject) {
    con.query("SELECT tamizajeID, fecha, respuestasJSON, puntos, notas, tipotamizaje.tipo from tamizaje INNER JOIN tipotamizaje where tipotamizaje.tipoID = tipoTamizaje and pacienteID = '" + pacienteID+"';",
      function (err, rows) {
        if (err) throw err;
        results = Object.values(JSON.parse(JSON.stringify(rows)));
        resolve(results);
      }
    )
  });
};

getPatients = function () {
  return new Promise(function (resolve, reject) {
    con.query("SELECT * FROM paciente", function (err, rows, fields) {
      if (err) throw err;
      results = Object.values(JSON.parse(JSON.stringify(rows)));
      resolve(results);
    });
  });
};

const swaggerSpec = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "GERIATRIK API",
      version: "0.1.0",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: [`${path.join(__dirname, "./index.js")}`],
};

const app = express();
app.use(express.json());
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));
app.use(
  "/api-doc",
  swaggerUI.serve,
  swaggerUI.setup(swaggerJsDoc(swaggerSpec))
);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

/**
 * @swagger
 * components:
 *  schemas:
 *      Patient:
 *          type: object
 *          properties:
 *              pacienteID:
 *                  type: string
 *                  description: Identificador unico del paciente
 *              nombre:
 *                  type: string
 *                  description: Nombre del paciente
 *              apellidoP:
 *                  type: string
 *                  description: Apellido paterno del paciente
 *              apellidoM:
 *                  type: string
 *                  description: Apellido materno del paciente
 *              fechaNac:
 *                  type: date
 *                  description: Fecha de naciemiento del paciente
 *              sexo:
 *                  type: string
 *                  description: Apellido materno del paciente
 *              escolaridad:
 *                  type: string
 *                  description: Apellido materno del paciente
 *              discapacidades:
 *                  type: string
 *                  description: Apellido materno del paciente
 *              quejaMemoria:
 *                  type: bool
 *                  description: Apellido materno del paciente
 *              hipoacusia_severa:
 *                  type: bool
 *                  description: Apellido materno del paciente
 *              contactoEmergencia:
 *                  type: int
 *                  description: Apellido materno del paciente
 *              imagenPerfil:
 *                  type: string
 *                  description: Apellido materno del paciente
 *      Employee:
 *        type: object
 *        properties:
 *              empleadoID:
 *                  type: int
 *                  description: Identificador unico del empleado
 *              nombre:
 *                  type: string
 *                  description: Nombre del empleado
 *              apellidoP:
 *                  type: string
 *                  description: Apellido paterno del empleado
 *              apellidoM:
 *                  type: string
 *                  description: Apellido materno del empleado
 *              fechaNac:
 *                  type: date
 *                  description: Fecha de naciemiento del empleado
 *              tipoEmpleado:
 *                  type: int
 *                  description: Tipo de empleado
 *              sexo:
 *                  type: string
 *                  description: Apellido materno del empleado
 *              cedula:
 *                  type: string
 *                  description: Cedula profesional del empleado
 *              email:
 *                  type: string
 *                  description: Correo electróncio del empleado
 *              password:
 *                  type: bool
 *                  description: Contraseña del empleado
 *              imagenPerfil:
 *                  type: string
 *                  description: Apellido materno del empleado
 *      Tamizaje:
 *        type: object
 *        properties:
 *                tamizajeID:
 *                      type: int
 *                      description: Identificador unico del tamizaje
 *                tipoTamizaje:
 *                      type: int
 *                      description: Tipo de tamizaje (0 = MOCA)
 *                empleadoID:
 *                      type: int
 *                      description: Empleado que esta aplicando el tamizaje
 *                pacienteID:
 *                      type: int
 *                      description: Paciente que esta haciendo el tamizaje
 *                fecha:
 *                      type: date
 *                      description: Fecha cuando se aplicó el tamizaje
 *                respuestasJSON:
 *                      type: string
 *                      description: Respuestas en formato JSON del tamizaje
 *                puntos:
 *                      type: int
 *                      description: puntos totales del tamizaje
 *                notas:
 *                      type: string
 *                      description: Notas del tamizaje
 */

/**
 * @swagger
 * /api-info:
 *  get:
 *      tags:
 *        - "Api"
 *      summary: Retorna un mensaje de informacion del api
 */
app.get("/api-info", (req, res) => {
  res.json({ message: "API version 0.1" });
});

/**
 * @swagger
 * /patients:
 *  get:
 *      summary: Retorna la lista de la base de datos de pacientes en el servidor
 *      tags: [Patient]
 */
app.get("/patients",auth ,(req, res) => {
  getPatients().then(function (results) {
    console.log(results);
    res.json({ message: results });
  });
});

/**
 * @swagger
 * /tamizaje/{pacienteID}:
 *  get:
 *      summary: Retorna la lista de los MOCA del paciente indicado con pacienteID
 *      tags: [Moca]
 */
app.get("/tamizaje/:pacienteID",auth, (req, res) => {
  // const {pacienteID} = req.body;
  console.log(req.params.pacienteID);
  getTamizaje(req.params.pacienteID).then(function (results) {
    console.log(results);
    res.json({ message: results });
  });
});

/**
 * @swagger
 * /patient/{id}:
 *  get:
 *      summary: Retorna el usuario seleccionado con el id
 *      tags: [Patient]
 */
 app.get("/patient/:id", auth,(req, res) => {
  getPatient(req.params.id).then(function (results) {
    console.log(results);
    res.json({ message: results });
  });
});

/**
 * @swagger
 * /profile/{id}:
 *  get:
 *      summary: Retorna el empleado seleccionado con el id
 *      tags: [Empleado]
 */
 app.get("/profile/:id", auth,(req, res) => {
  getProfile(req.params.id).then(function (results) {
    console.log(results);
    res.json({ message: results });
  });
});

/**
 * @swagger
 * /addPatient:
 *  post:
 *      summary: Agreaga un nuevo paciente en la base de datos y retorna el resultado
 *      tags: [Patient]
 */
app.post("/addPatient", auth,(req, res) => {
  const {name, lastName, motherLastName, birthday, gender, scholarity, disabilities, memoryComplaint, severeHearingLoss, emergencyContact, image} = req.body;

  console.log(req.body);

  addPatient(name, lastName, motherLastName, birthday, gender, scholarity, disabilities, memoryComplaint, severeHearingLoss, emergencyContact, image).then(function (results) {
    console.log(results);
    res.json({ message: results });
    
  });
});

/**
 * @swagger
 * /register:
 *  post:
 *      summary: Ingresa datos del empleado en la BD y retorna su nombre, ID y token de acceso
 *      tags: [Empleado]
 */
app.post("/register", async (req,res) => {
  //destructure body
  const {name, lastnameP,lastnameM,date,type,sex,cedula,email,password,pfp} = req.body;
  
  try {
    //password hashing
    const salt = await bcrypt.genSalt(10); 
    cont = await bcrypt.hash(password,salt);

    //insert query
    addEmployee(name, lastnameP,lastnameM,date,type,sex,cedula,email,cont,pfp).then(function (results){
      
      //if insert query was successfull
      if(results["affectedRows"] != 0){
        //payload to send in jwt
        const payload = {
          user: {
              cedula: cedula
          }
        }

        //sign the jwt to ensure it hasn't been altered, sign uses payload and secret
        jwt.sign(payload,"secret",{
          expiresIn: 3600
        },(err,token) => {
            //return generated jwt
            if(err) throw err;

            //get new userID
            getUser(email).then(function(results){
              const User = {
                empleadoID: results[0]["empleadoID"],
                name: name,
                token: token
              }
              //return user data and access token
              res.json(User);
            });
        });
      }else{
        return res.status(400).json({msg: 'User already exists'});
      }
    });
  } catch (error) {
    res.status(500).send('Server error');
  }
  
});

/**
 * @swagger
 * /login:
 *  post:
 *      summary: Revisa las credenciales del usuario y retorna su ID, nombre y token de acceso
 *      tags: [Empleado]
 */

app.post("/login", (req, res) => {
  const {email,password} = req.body;

  try {
    //find user by email
    getUser(email).then(async function (results){
      //if user is found
      if(results.length != 0){

        //checks if passwords match 
        const isMatch = await bcrypt.compare(password,results[0]["password"]);

        if(!isMatch){
          return res.status(400).json({msg: 'Invalid Credentials'});
        }
        
        //payload to send in jwt
        const payload = {
          user: {
              cedula: results[0]["cedula"]
          }
        }

        //sign the jwt to ensure it hasn't been altered, sign uses payload and secret
        jwt.sign(payload,"secret",{
          expiresIn: 3600
        },(err,token) => {
            //return generated jwt
            if(err) throw err;

            const User = {
              empleadoID: results[0]["empleadoID"],
              name: results[0]["nombre"],
              token: token
            }
            
            //return user data and access token
            res.json(User);
        });        
      }else{
        return res.status(400).json({msg: 'Invalid Credentials'});
      }
    })
  } catch (error) {
    res.status(500).send('Server error');
  }
});

/**
 * @swagger
 * /moca:
 *  post:
 *      summary: Guarda los resultados del moca en la bd 
 *      tags: [Moca]
 */
app.post("/moca", auth,(req, res) => {
  addMoca(req.body).then(function (results) {
    console.log(results);
    res.json({ message: results });
  });
});

addMoca = function (props) {
  const {tipoTamizaje, empleadoId, pacienteId, fecha, respuestasJSON, puntos} = props;

  return new Promise(function (resolve, reject) {
    con.query("INSERT INTO tamizaje VALUES (" + null + ", " + tipoTamizaje + ", " + empleadoId + ", " + pacienteId + ", " + "'" + fecha + "'" + ", " + "'" + respuestasJSON + "'" + ", " + puntos + "," + "notas" + ");",
      function (err, rows, fields) {
        if (err) throw err;
        results = Object.values(JSON.parse(JSON.stringify(rows)));
        resolve(results);
      }
    );
  });
};