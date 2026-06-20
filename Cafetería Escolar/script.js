(function () {
  'use strict';
 
  /* ---------- Panel "¿Qué significa cada columna?" ---------- */
  var btnInfo = document.getElementById('btnInfo');
  var panelInfo = document.getElementById('panelInfo');
 
  btnInfo.addEventListener('click', function () {
    var abierto = btnInfo.getAttribute('aria-expanded') === 'true';
    btnInfo.setAttribute('aria-expanded', String(!abierto));
    panelInfo.hidden = abierto;
    btnInfo.querySelector('span').textContent = abierto ? '＋' : '－';
  });
 
  /* ---------- Acordeón de cada ítem de las tarjetas ---------- */
  document.querySelectorAll('.item').forEach(function (boton) {
    boton.addEventListener('click', function () {
      var abierto = boton.getAttribute('aria-expanded') === 'true';
      boton.setAttribute('aria-expanded', String(!abierto));
    });
  });
 
  /* ---------- Simulación del pedido ---------- */
  var btnSimular = document.getElementById('btnSimular');
  var narrador = document.getElementById('narrador');
  var corredor = document.getElementById('corredor');
  var riel = document.querySelector('.riel');
  var estaciones = Array.prototype.slice.call(document.querySelectorAll('.riel__estacion'));
  var tarjetas = Array.prototype.slice.call(document.querySelectorAll('.tarjeta'));
  var reduceMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 
  var historia = {
    1: '👦 <strong>Entidad:</strong> el estudiante llega a la caja y decide qué comprar.',
    2: '📝 <strong>Entrada:</strong> indica su pedido y entrega el pago — caja recibe ambos datos.',
    3: '🔥 <strong>Proceso:</strong> el sistema cobra, genera la orden para cocina y descuenta el inventario.',
    4: '🍽️ <strong>Salida:</strong> el estudiante recibe su comida y su ticket; caja suma todo al reporte del día.'
  };
 
  function tarjetaDe(etapa) {
    return tarjetas.filter(function (t) { return t.dataset.etapa === String(etapa); })[0];
  }
  function estacionDe(etapa) {
    return estaciones.filter(function (e) { return e.dataset.etapa === String(etapa); })[0];
  }
 
  function moverCorredorA(etapa) {
    var estacion = estacionDe(etapa);
    var puntoEl = estacion.querySelector('.riel__punto');
    var rRiel = riel.getBoundingClientRect();
    var rPunto = puntoEl.getBoundingClientRect();
    var x = rPunto.left - rRiel.left;
    var y = rPunto.top - rRiel.top;
    corredor.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  }
 
  function limpiarEstados() {
    estaciones.forEach(function (e) {
      var p = e.querySelector('.riel__punto');
      p.classList.remove('activo', 'hecho');
    });
    tarjetas.forEach(function (t) { t.classList.remove('en-curso'); });
  }
 
  function esperar(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, reduceMovimiento ? Math.min(ms, 200) : ms); });
  }
 
  async function simular() {
    btnSimular.disabled = true;
    btnSimular.querySelector('.boton-simular__icono').textContent = '⏳';
    limpiarEstados();
    corredor.classList.add('visible');
    moverCorredorA(1);
    await esperar(50);
 
    for (var etapa = 1; etapa <= 4; etapa++) {
      // marcar la etapa anterior como hecha
      if (etapa > 1) {
        var anterior = estacionDe(etapa - 1).querySelector('.riel__punto');
        anterior.classList.remove('activo');
        anterior.classList.add('hecho');
        tarjetaDe(etapa - 1).classList.remove('en-curso');
      }
 
      moverCorredorA(etapa);
      estacionDe(etapa).querySelector('.riel__punto').classList.add('activo');
      tarjetaDe(etapa).classList.add('en-curso');
 
      narrador.style.opacity = 0;
      await esperar(180);
      narrador.innerHTML = historia[etapa];
      narrador.style.opacity = 1;
 
      await esperar(1500);
    }
 
    // cerrar última etapa
    var ultimo = estacionDe(4).querySelector('.riel__punto');
    ultimo.classList.remove('activo');
    ultimo.classList.add('hecho');
    tarjetaDe(4).classList.remove('en-curso');
 
    narrador.style.opacity = 0;
    await esperar(180);
    narrador.innerHTML = '✅ <strong>Pedido completado</strong> — los cuatro componentes del sistema trabajaron en conjunto.';
    narrador.style.opacity = 1;
 
    btnSimular.disabled = false;
    btnSimular.querySelector('.boton-simular__icono').textContent = '↻';
    btnSimular.lastChild.textContent = ' Repetir simulación';
  }
 
  btnSimular.addEventListener('click', simular);
 
  // Reposicionar el corredor si la ventana cambia de tamaño (p. ej. al pasar a vista móvil)
  var reposicionando = null;
  window.addEventListener('resize', function () {
    clearTimeout(reposicionando);
    reposicionando = setTimeout(function () {
      var activa = estaciones.filter(function (e) {
        return e.querySelector('.riel__punto').classList.contains('activo');
      })[0];
      if (activa) moverCorredorA(activa.dataset.etapa);
    }, 120);
  });
})();