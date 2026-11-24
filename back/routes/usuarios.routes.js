import express from "express"
import { registro, login, yo } from "../controllers/usuarios.controller.js"
import { pedirToken } from "../middlewares/autorizacion.middleware.js"

const router = express.Router()

router.post("/registro", registro)  
router.post("/login", login)     
router.get("/yo", pedirToken, yo)

export default router
