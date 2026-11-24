import dotenv from "dotenv"
dotenv.config()                

import express from "express"
import cors from "cors"
import { conectarBase } from "./config/db.js"
import { pedirToken } from "./middlewares/autorizacion.middleware.js"
import usuariosRouter from "./routes/usuarios.routes.js"
import peliculasRouter from "./routes/peliculas.routes.js"
import topRouter from "./routes/top.routes.js"
import resenasRouter from "./routes/resenas.routes.js"

await conectarBase()                           

const app = express()                            
const PORT = process.env.PORT || 3000          


app.use(cors())
app.use(express.json())


app.use((req, res, next) => {
    console.log(req.method + " " + req.url)
    next()
})

app.get("/", (req, res) => {
    res.json({ mensaje: "Bienvenidos al Archivo del Terror" })
})

app.use("/usuarios", usuariosRouter)

app.use("/peliculas", pedirToken, peliculasRouter)
app.use("/top", pedirToken, topRouter)
app.use("/resenas", pedirToken, resenasRouter)


app.use((req, res) => {
    res.status(404).json({ mensaje: "Esa ruta no existe en el Archivo del Terror" })
})

app.use((err, req, res, next) => {
    console.error(err)
    const codigo = err.status || 500
    res.status(codigo).json({ mensaje: "Algo salió mal en el archivo (error " + codigo + ")" })
})


app.listen(PORT, () => {              
    console.log("Horror Topster abierto en http://localhost:" + PORT)
})
