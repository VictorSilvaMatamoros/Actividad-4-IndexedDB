let bd; // Variable global para la base de datos

let notas = document.createElement("div");
notas.id = "notas";
document.body.appendChild(notas);

let inputNota = document.createElement("input");
inputNota.id = "inputNota";
inputNota.style.color = "red";
inputNota.style.backgroundColor = "black";
inputNota.style.border = "1px solid black";
document.body.appendChild(inputNota);

let btnCrear = document.createElement("button");
btnCrear.innerHTML = "Crear";
document.body.appendChild(btnCrear);
btnCrear.addEventListener("click", crearNota);

let btnBorrarTodo = document.createElement("button");
btnBorrarTodo.classList.add("btnBorrarTodo");
btnBorrarTodo.innerHTML = "Borrar todo";
document.body.appendChild(btnBorrarTodo);
btnBorrarTodo.addEventListener("click", borrarTodasLasNotas);

abrirBaseDatos();

function abrirBaseDatos() {
    let solicitudConexion = indexedDB.open("MisNotas");

    solicitudConexion.onsuccess = function (evento) {
        bd = evento.target.result;
        mostrarNotas(); 
    };

    solicitudConexion.onerror = function (evento) {
        let resultado = document.createElement("div");
        resultado.innerHTML = `Error al abrir la base de datos: ${evento.target.errorCode}`;
        document.body.appendChild(resultado);
    };

    solicitudConexion.onupgradeneeded = function (evento) {
        bd = evento.target.result;
        bd.createObjectStore('notas', { keyPath: "id", autoIncrement: true });
    };
}

function mostrarNotas() {
    let transaction = bd.transaction(["notas"], "readonly");
    let almacenNotas = transaction.objectStore("notas");
    let request = almacenNotas.getAll();

    request.onsuccess = function (evento) {
        let notasGuardadas = evento.target.result;
        notasGuardadas.forEach(nota => {
            agregarNotaDOM(nota.nota);
        });
    };
}

function agregarNotaDOM(notaEscrita) {
    let nota = document.createElement("div");
    nota.classList.add("nota");

    let btnBorrar = document.createElement("button");
    btnBorrar.classList.add("btnBorrar");
    btnBorrar.innerHTML = "Borrar";
    btnBorrar.addEventListener("click", () => borrarNota(notaEscrita));

    nota.innerHTML = notaEscrita;
    nota.appendChild(btnBorrar);
    document.getElementById("notas").appendChild(nota);
}

function crearNota() {
    let notaEscrita = document.getElementById("inputNota").value;

    const LimiteNotas = document.querySelectorAll(".nota");
    if (LimiteNotas.length >= 5) {
        alert("No se puede crear más de 5 notas.");
        return;
    }

    let transaction = bd.transaction(["notas"], "readwrite");
    let almacenTransaccion = transaction.objectStore("notas");
    let agregar = almacenTransaccion.add({ nota: notaEscrita });

    agregar.onsuccess = function () {
        agregarNotaDOM(notaEscrita);
        document.getElementById("inputNota").value = "";
    };

    agregar.onerror = function (event) {
        console.error("Error al agregar nota", event);
    };
}

function borrarNota(notaEscrita) {
    let transaction = bd.transaction(["notas"], "readwrite");
    let almacenNotas = transaction.objectStore("notas");

    let request = almacenNotas.getAll();
    request.onsuccess = function (evento) {
        let notasGuardadas = evento.target.result;
        let notaAEliminar = notasGuardadas.find(nota => nota.nota === notaEscrita);
        
        if (notaAEliminar) {
            almacenNotas.delete(notaAEliminar.id);
            document.getElementById("notas").innerHTML = ""; 
            mostrarNotas();
        }
    };
}

function borrarTodasLasNotas() {
    let transaction = bd.transaction(["notas"], "readwrite");
    let almacenNotas = transaction.objectStore("notas");
    almacenNotas.clear(); 
    document.getElementById("notas").innerHTML = ""; 
}