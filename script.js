document.addEventListener('DOMContentLoaded', function () {

  var form = document.getElementById('formBusca');
  var campo = document.getElementById('campoBusca');
  var feedback = document.getElementById('feedbackBusca');
  var textoFeedback = document.getElementById('textoFeedback');
  var btnLimpar = document.getElementById('limparBusca');
  var itens = document.querySelectorAll('.busca-item');

  function normalizar(texto) {
    return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function removerDestaques() {
    document.querySelectorAll('mark.busca-destaque').forEach(function (m) {
      var pai = m.parentNode;
      pai.replaceChild(document.createTextNode(m.textContent), m);
      pai.normalize();
    });
  }

  function destacarTermo(elemento, termoNorm) {
    var walker = document.createTreeWalker(elemento, NodeFilter.SHOW_TEXT, null);
    var nos = [];
    while (walker.nextNode()) { nos.push(walker.currentNode); }
    nos.forEach(function (no) {
      var original = no.nodeValue;
      var norm = normalizar(original);
      var pos = norm.indexOf(termoNorm);
      if (pos === -1 || !original.trim()) return;
      if (no.parentNode.closest('button, script, style')) return;
      var antes = document.createTextNode(original.slice(0, pos));
      var mark = document.createElement('mark');
      mark.className = 'busca-destaque';
      mark.textContent = original.slice(pos, pos + termoNorm.length);
      var depois = document.createTextNode(original.slice(pos + termoNorm.length));
      var pai = no.parentNode;
      pai.insertBefore(antes, no);
      pai.insertBefore(mark, no);
      pai.insertBefore(depois, no);
      pai.removeChild(no);
    });
  }

  function limparBusca() {
    removerDestaques();
    itens.forEach(function (item) { item.classList.remove('busca-oculto'); });
    feedback.classList.add('d-none');
    campo.value = '';
  }

  function executarBusca(termo) {
    removerDestaques();
    var termoNorm = normalizar(termo.trim());

    if (termoNorm === '') { limparBusca(); return; }

    var encontrados = 0;
    var primeiro = null;
    itens.forEach(function (item) {
      var combina = normalizar(item.textContent).indexOf(termoNorm) !== -1;
      item.classList.toggle('busca-oculto', !combina);
      if (combina) {
        encontrados++;
        if (!primeiro) primeiro = item;
        destacarTermo(item, termoNorm);
      }
    });

    feedback.classList.remove('d-none');
    if (encontrados === 0) {
      textoFeedback.textContent = 'Nenhum resultado para "' + termo.trim() + '". Tente outra palavra.';
    } else {
      textoFeedback.textContent = encontrados + ' resultado(s) para "' + termo.trim() + '".';
      primeiro.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      executarBusca(campo.value);
    });
    campo.addEventListener('input', function () {
      if (campo.value.trim() === '') { limparBusca(); }
      else { executarBusca(campo.value); }
    });
  }
  if (btnLimpar) { btnLimpar.addEventListener('click', limparBusca); }

  var btnTopo = document.getElementById('btnTopo');
  var DISTANCIA_PARA_APARECER = 300;

  window.addEventListener('scroll', function () {
    btnTopo.classList.toggle('visivel', window.scrollY > DISTANCIA_PARA_APARECER);
  });
  btnTopo.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  var btnEnviar = document.getElementById('enviarRecado');
  var modalEl = document.getElementById('recadoModal');
  if (btnEnviar && modalEl) {
    btnEnviar.addEventListener('click', function () {
      var nome = document.getElementById('nomeVisitante').value.trim();
      var msg = document.getElementById('mensagemTexto').value.trim();
      if (!msg) {
        alert('Escreva uma mensagem antes de enviar.');
        return;
      }
      alert('Valeu' + (nome ? ', ' + nome : '') + '! Seu recado foi registrado.');
      document.getElementById('formRecado').reset();
      var modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modal.hide();
    });
  }

  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () {
      img.classList.add('img-vazia');
      img.removeAttribute('src');
    });
  });

});
