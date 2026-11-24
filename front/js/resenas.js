import { crearElemento, crearEsqueleto } from "./comunes.js"
import { abrirModal } from "./modal.js"


export function iniciales(nombre) {
    const partes = nombre.replace("@", "").trim().split(" ")
    if (partes.length > 1) {
        return (partes[0][0] + partes[1][0]).toUpperCase()
    }
    return partes[0].slice(0, 2).toUpperCase()
}

export function haceCuanto(fechaTexto) {
    const fecha = new Date(fechaTexto)

    const minutos = Math.floor((Date.now() - fecha.getTime()) / 60000)

    if (minutos < 1) {
        return "Hace un momento"
    }
    if (minutos < 60) {
        return "Hace " + minutos + (minutos === 1 ? " minuto" : " minutos")
    }
    const horas = Math.floor(minutos / 60)
    if (horas < 24) {
        return "Hace " + horas + (horas === 1 ? " hora" : " horas")
    }
    const dias = Math.floor(horas / 24)
    if (dias < 30) {
        return "Hace " + dias + (dias === 1 ? " día" : " días")
    }
    return fecha.toLocaleDateString("es-UY")
}


export function ordenarResenas(resenas, orden) {
    const copia = resenas.slice()

    if (orden === "recientes") {
        copia.sort((a, b) => new Date(b.fechaDeCreacion) - new Date(a.fechaDeCreacion))
    } else if (orden === "altas") {
        copia.sort((a, b) => b.puntaje - a.puntaje)
    } else if (orden === "bajas") {
        copia.sort((a, b) => a.puntaje - b.puntaje)
    }
    return copia
}


export function activarFiltro(alCambiar) {
    const btnFiltro = document.querySelector("#btnFiltro")
    const menuFiltro = document.querySelector("#menuFiltro")
    const botonesOrden = document.querySelectorAll("#menuFiltro button")

    btnFiltro.addEventListener("click", () => {
        const abierto = menuFiltro.classList.toggle("abierto")
        btnFiltro.setAttribute("aria-expanded", String(abierto))
    })

    botonesOrden.forEach((boton) => {
        boton.addEventListener("click", () => {
            botonesOrden.forEach((otro) => {
                otro.classList.remove("activo")
            })
            boton.classList.add("activo")

            menuFiltro.classList.remove("abierto")
            btnFiltro.setAttribute("aria-expanded", "false")
            alCambiar(boton.dataset.orden)
        })
    })
}


export function pintarResenasEsqueleto(lista, estado) {
    estado.textContent = ""

    lista.innerHTML = ""
    for (let i = 0; i < 3; i++) {
        const li = crearElemento("li", "resena")
        li.setAttribute("aria-hidden", "true")

        const cabeza = crearElemento("div", "resena-cabeza")
        cabeza.appendChild(crearEsqueleto("esqueleto-circulo"))
        const quien = crearElemento("div", "esqueleto-quien")
        quien.appendChild(crearEsqueleto("esqueleto-linea", "8rem"))
        quien.appendChild(crearEsqueleto("esqueleto-linea esqueleto-chica", "5rem"))
        cabeza.appendChild(quien)
        li.appendChild(cabeza)

        const cuerpo = crearElemento("div", "esqueleto-resena-cuerpo")
        cuerpo.appendChild(crearEsqueleto("esqueleto-linea", "2.5rem"))
        cuerpo.appendChild(crearEsqueleto("esqueleto-linea", "100%"))
        cuerpo.appendChild(crearEsqueleto("esqueleto-linea", i === 1 ? "45%" : "75%"))
        li.appendChild(cuerpo)

        lista.appendChild(li)
    }
}


const TIEMPO_PARA_EDITAR = 2 * 60 * 60 * 1000

export function sePuedeEditar(resena) {
    const pasado = Date.now() - new Date(resena.fechaDeCreacion).getTime()
    return pasado <= TIEMPO_PARA_EDITAR
}


export function crearAccionesResena(resena, alEditar, alEliminar) {
    const acciones = crearElemento("div", "resena-acciones")

    if (sePuedeEditar(resena)) {
        const btnEditar = crearElemento("button", "boton-mini", "Editar")
        btnEditar.type = "button"
        btnEditar.addEventListener("click", alEditar)
        acciones.appendChild(btnEditar)
    }

    const btnEliminar = crearElemento("button", "boton-mini boton-mini-eliminar", "Eliminar")
    btnEliminar.type = "button"
    btnEliminar.addEventListener("click", alEliminar)
    acciones.appendChild(btnEliminar)

    return acciones
}


export function confirmarBorrado(alAceptar) {
    abrirModal({
        titulo: "¿Borrar tu reseña?",
        texto: "Una vez que la borres no la vas a poder recuperar.",
        textoCancelar: "Cancelar",
        textoAceptar: "Eliminar",
        alAceptar: alAceptar
    })
}
