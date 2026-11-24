import express from "express"
import { listar, listarMias, crear, editar, borrar } from "../controllers/resenas.controller.js"

const router = express.Router()

router.get("/", listar)
router.get("/mias", listarMias)
router.post("/", crear)
router.put("/:id", editar)
router.delete("/:id", borrar)

export default router
