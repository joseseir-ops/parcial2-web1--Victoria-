# Parcial 2 · Respuestas de razonamiento

Nombre: Jose Seir Victoria Colorado

Son cuatro preguntas de 5 puntos sobre código que ya conoces. Para cada una:

1. Lee el código y escribe primero lo que **crees** que pasa.
2. Compruébalo: pégalo en la consola de DevTools (F12 → Console) con tu página del parcial abierta en Live Server. En esa consola sí se puede usar `await` fuera de una función.
3. Escribe tu respuesta debajo de cada letra: (a), (b), (c)…

Se califica la explicación, no solo el resultado: con dos o tres frases por letra es suficiente. Escríbela con tus palabras, porque te la pueden preguntar.

## P1 · ¿En qué orden se imprime? (5 puntos)

**Lo viste en:** la función `cargar` del Explorador (semana 8): «await pausa ESTA función, no el navegador».

```js
console.log('1');
setTimeout(() => console.log('2'), 0);
const cargar = async () => {
  console.log('3');
  const respuesta = await fetch('https://rickandmortyapi.com/api/episode/1');
  console.log('4');
};
cargar();
console.log('5');
```

**(a)** Los cinco números en el orden en que salen en la consola. (2 pts)

Respuesta: Orden exacto: Se imprimirá 1, 3, 5, 2, 4.

**(b)** Por qué el `3` sale **antes** que el `5`, si `cargar` es una función `async`. (2 pts)

Respuesta: El 3 sale antes que el 5 porque aunque la función cargar tiene la palabra async, en JavaScript el código de una función asíncrona se ejecuta de manera inmediata hasta que se topa con el primer await. Por eso entra a la función e imprime el 3 inmediatamente antes de hacer la pausa de la red.

**(c)** Por qué el `5` no espera a que termine el `fetch`, y por qué el `2` y el `4` salen al final. (1 pt)

Respuesta: Porque La palabra await solo pausa la función cargar, no congela el navegador completo. Mientras cargar se queda esperando a que la API responda, JavaScript sigue leyendo lo que hay debajo e imprime el 5. 

El número 2 (setTimeout) y el 4 (lo que sigue del fetch) son enviados a "salas de espera" en segundo plano. Cuando el hilo principal queda libre tras imprimir el 5, atiende a los que estaban esperando (el 2 sale primero porque el temporizador es más rápido que el viaje por internet de la petición HTTP, dejando al 4 de último).

## P2 · Un 404 que no llega al catch (5 puntos)

**Lo viste en:** el `pedirJSON` del Explorador (semana 8): «fetch solo falla si NO pudo hablar con el servidor».

El episodio 9999 no existe: la API responde con código **404** y el cuerpo `{"error":"Episode not found"}`.

```js
try {
  const respuesta = await fetch('https://rickandmortyapi.com/api/episode/9999');
  const datos = await respuesta.json();
  console.log('Episodio:', datos.name);
} catch (error) {
  console.log('Falló:', error.message);
}
```

**(a)** Qué imprime la consola, exactamente. (1 pt)

Respuesta: Episodio: undefined

**(b)** Por qué **no** entra al `catch`, aunque el episodio no existe. Pista: piensa en la diferencia entre «el servidor respondió con un 404» y «no hubo respuesta» (por ejemplo, sin internet). (2 pts)

Respuesta: Por qué no entra al catch para fetch, recibir un error 404 del servidor es un éxito de comunicación. 
El catch solo se activa cuando hay un fallo de red por ejemplo, se te cae el internet o el servidor no existe. Como el servidor de Rick and Morty sí contestó diciendo "no lo encontré", fetch no lo considera un error que deba lanzarse al catch.

**(c)** La línea que falta para que sí entre al `catch`: escríbela e indica en qué parte del código va. Luego escribe qué imprimiría la consola con esa línea. (2 pts)

Respuesta: Falta la validación manual del estado HTTP. Debe ir exactamente debajo de la línea del fetch: 
if (!respuesta.ok) throw new Error('HTTP 404');
Al agregarla, el sistema fuerza el error y la consola imprimiría: Falló: HTTP 404.

## P3 · LocalStorage sin JSON (5 puntos)

**Lo viste en:** `js/favoritos.js` del Explorador (semana 8): «localStorage solo guarda TEXTO».

```js
const vistos = [1, 5, 8];
localStorage.setItem('vistos', vistos);
const leido = localStorage.getItem('vistos');
console.log(leido, typeof leido);      // (a)
console.log(leido.length);             // (b)
const recuperado = JSON.parse(leido);  // (c)
```

**(a)** Qué imprime la línea marcada (a): el valor y su tipo. (1 pt)

Respuesta:Imprime 1,5,8 string. Como LocalStorage solo acepta texto, JavaScript forzó el arreglo a convertirse en una cadena de texto separada por comas.

**(b)** Qué imprime la línea marcada (b), y por qué da ese número. (1 pt)

Respuesta: Imprime el numero 5. Ya no es un arreglo de 3 elementos, sino un texto. La palabra "1,5,8" tiene exactamente 5 caracteres (tres números y dos comas).

**(c)** Qué pasa en la línea marcada (c): ¿funciona o sale un error? Si sale un error, cuál y por qué. (1 pt)

Respuesta: Sale un SyntaxError. 
JSON.parse intenta leer el texto como un formato JSON válido, pero los arreglos en JSON obligatoriamente deben llevar corchetes (ej. "[1,5,8]"). Al recibir "1,5,8" puro, se rompe.

**(d)** La segunda línea corregida, para que `recuperado` vuelva a ser el array `[1, 5, 8]`. (1 pt)

Respuesta: Línea corregida: Para que se guarde con sus corchetes reales:
localStorage.setItem('vistos', JSON.stringify(vistos));

**(e)** Por qué en tu `leerVistos` el `JSON.parse` va dentro de un `try/catch`: qué podría pasarle a la app si no estuviera. (1 pt)

Respuesta:Si un usuario entra a sus DevTools y altera manualmente el texto de LocalStorage poniendo algo inválido (como {roto), JSON.parse lanzaría un error crítico que dejaría la pantalla en blanco y rompería toda tu app. 
El try/catch ataja esa explosión silenciosamente y permite devolver un arreglo vacío [] para que la página siga funcionando.

## P4 · Botones que dejan de funcionar (5 puntos)

**Lo viste en:** la delegación en la grilla del Explorador (semana 7, paso 04). Está explicada en el README, en R6: «¿Qué es la delegación?».

Un compañero escribió este código. Al cargar la página, el primer clic en «Marcar como visto» funciona; pero después de ese clic, o después de escribir una letra en el buscador, **ningún botón responde**.

```js
render();
document.querySelectorAll('[data-id]').forEach((boton) => {
  boton.addEventListener('click', () => {
    vistos = alternarId(vistos, Number(boton.dataset.id));
    guardarVistos(vistos);
    render();
  });
});
```

**(a)** Qué les pasó a los botones. Pista: fíjate en qué hace `render()` con el contenido de `#lista` cada vez que se llama, y en cuántas veces se ejecuta el `forEach`. (2 pts)

Respuesta: La función render() borra todo el contenido HTML de #lista y crea botones nuevos en cada filtro o redibujado. El forEach inicial le puso escuchadores de clics a los botones que existían, pero esos botones fueron destruidos y reemplazados por la nueva llamada a render() dentro del mismo evento. entonces los botones nuevos nacen sin escuchador.

**(b)** El código reescrito con **delegación**: un solo listener en `#lista` que funcione con cualquier botón, aunque `render()` lo haya creado después. Se revisan tres cosas, 1 punto cada una: que el listener esté en `#lista` y no en los botones; que use `closest('[data-id]')` (o algo equivalente) para saber qué botón se presionó; y que no haga nada si el clic no fue en un botón. (3 pts)

Respuesta:

```js
lista.addEventListener('click', (evento) => {
  const boton = evento.target.closest('[data-id]');
  if (!boton) return; 
  vistos = alternarId(vistos, Number(boton.dataset.id));
  guardarVistos(vistos);
  render();
});
```
