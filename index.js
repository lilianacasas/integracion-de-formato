const { MongoClient } = require("mongodb");
const express = require("express");
const app = express();
app.use(express.json()); // Permite que Express interprete JSON en las solicitudes

// Configuración de la base de datos
const uri = "mongodb+srv://limatica66:2m182ade4PE54k5b@cluster0.or8ep.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0 despliegue mongo db";
const dbName = "dbSoftware";
const collectionName = "users";
const endPoint = "/user";
let col;

// Conexión a la base de datos MongoDB
async function db() {
    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect(); // Conecta al cliente MongoDB
        const db = client.db(dbName); // Selecciona la base de datos
        col = db.collection(collectionName); // Selecciona la colección 'users'
        console.log("Conectado a la base de datos MongoDB");
    } catch (error) {
        console.error("Error conectando a la base de datos:", error);
        process.exit(1); // Finaliza la ejecución si no puede conectarse
    }
}

db(); // Conectar a la base de datos al inicio del servidor

// Ruta de prueba para verificar que la API esté en funcionamiento
app.get("/", (req, res) => {
    res.send("La API está ejecutando");
});

// Obtener todos los usuarios
app.get(endPoint, async (req, res) => {
    try {
        const documents = await col.find().toArray(); // Obtiene todos los documentos de la colección
        res.json(documents); // Responde con los documentos en formato JSON
    } catch (error) {
        res.status(500).json({ error: "Error obteniendo datos" }); // En caso de error, responde con un error 500
    }
});

// Obtener un usuario por nombre
app.get(endPoint + "/:name", async (req, res) => {
    try {
        const query = { userName: req.params.name }; // Crea una consulta usando el nombre como parámetro
        const document = await col.findOne(query); // Busca un documento que coincida con el nombre
        if (document) {
            res.json(document); // Responde con el documento en formato JSON
        } else {
            res.status(404).json({ error: "Usuario no encontrado" }); // En caso de no encontrar el usuario
        }
    } catch (error) {
        res.status(500).json({ error: "Error obteniendo datos por nombre" }); // En caso de error, responde con un error 500
    }
});

// Obtener usuarios por rol
app.get(endPoint + "/role/:rol", async (req, res) => {
    try {
        const query = { role: req.params.rol }; // Crea una consulta usando el rol como parámetro
        const documents = await col.find(query).toArray(); // Busca todos los documentos que coincidan con el rol
        res.json(documents); // Responde con los documentos en formato JSON
    } catch (error) {
        res.status(500).json({ error: "Error obteniendo usuarios por rol" }); // En caso de error, responde con un error 500
    }
});

// Crear usuario
app.post(endPoint, async (req, res) => {
    try {
        const newUser = req.body; // Obtiene los datos del nuevo usuario desde el cuerpo de la solicitud
        if (!newUser.userName || !newUser.email) {
            return res.status(400).json({ error: "El nombre de usuario y el correo son obligatorios" }); // Validación de campos
        }
        await col.insertOne(newUser); // Inserta un nuevo documento en la colección
        res.status(201).json(newUser); // Responde con el documento creado en formato JSON
    } catch (error) {
        res.status(500).json({ error: "Error creando usuario" }); // En caso de error, responde con un error 500
    }
});

// Actualizar usuario
app.put(endPoint + "/:name", async (req, res) => {
    try {
        const result = await col.updateMany(
            { userName: req.params.name }, // Busca los documentos por nombre
            { $set: req.body } // Actualiza el documento con los nuevos datos
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" }); // Si no se encuentra el usuario
        }
        res.json(req.body); // Responde con los nuevos datos en formato JSON
    } catch (err) {
        res.status(500).json({ error: "Error actualizando usuario" }); // En caso de error, responde con un error 500
    }
});

// Eliminar usuario
app.delete(endPoint + "/:name", async (req, res) => {
    try {
        const result = await col.deleteMany({ userName: req.params.name }); // Elimina los documentos por nombre
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" }); // Si no se encuentra el usuario
        }
        res.json({ message: "Usuario eliminado exitosamente" }); // Responde con un mensaje de éxito
    } catch (error) {
        res.status(500).json({ error: "Error eliminando usuario" }); // En caso de error, responde con un error 500
    }
});

/**
 * FORMULARIO DE CONTACTO
 * 
 * Esta ruta permitirá a los usuarios enviar un mensaje de contacto, y a la vez,
 * creará un nuevo usuario en la base de datos. Los datos requeridos son nombre,
 * email y mensaje.
 */
app.post("/contact", async (req, res) => {
    try {
        const { userName, email, message } = req.body;

        // Validación de datos
        if (!userName || !email || !message) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }

        // Creación de un nuevo usuario a partir del formulario de contacto
        const newUser = {
            userName,
            email,
            role: "cliente", // Se asigna un rol predeterminado al usuario
            message, // Se guarda el mensaje en el documento del usuario
        };

        await col.insertOne(newUser); // Inserta el nuevo usuario en la base de datos
        res.status(201).json({ message: "Contacto enviado y usuario creado exitosamente", user: newUser });
    } catch (error) {
        res.status(500).json({ error: "Error al enviar contacto y crear usuario" });
    }
});

// Servidor escuchando en el puerto 3000
app.listen(3000, () => {
    console.log("Servidor está corriendo en http://localhost:3000");
});
