import express from "express"
import { listar, obtener } from "../controllers/peliculas.controller.js"

const router = express.Router()

router.get("/", listar)      
router.get("/:id", obtener)    

export default router
