import express from "express"
import { listar, agregar, quitar, ordenar } from "../controllers/top.controller.js"

const router = express.Router()

router.get("/", listar)       
router.post("/", agregar)       
router.put("/orden", ordenar)
router.delete("/:id", quitar)   

export default router
