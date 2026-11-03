// Imagens que ainda não existem viram um placeholder com o nome do arquivo esperado
document.querySelectorAll('.shot img').forEach((img) => {
  const toPlaceholder = () => {
    const shot = img.parentElement;
    shot.classList.add('placeholder');
    const title = shot.parentElement.querySelector('h3');
    shot.dataset.label = title ? title.textContent : '';
    img.remove();
  };
  if (img.complete && img.naturalWidth === 0) toPlaceholder();
  else img.addEventListener('error', toPlaceholder);
});

// Filtro de projetos
const chips = document.querySelectorAll('.chip');
const cards = document.querySelectorAll('.card');
chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chips.forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    const f = chip.dataset.filter;
    cards.forEach((card) => {
      const tags = card.dataset.tags.split(' ');
      card.classList.toggle('hidden', f !== 'all' && !tags.includes(f));
    });
  });
});

// Aviso
const toast = document.querySelector('.toast');
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

// Links ainda sem destino
document.querySelectorAll('[data-placeholder]').forEach((a) => {
  a.addEventListener('click', (e) => {
    if (a.getAttribute('href') === '#') {
      e.preventDefault();
      showToast('Link em breve');
    }
  });
});

// Copiar prompt de exemplo
const copyBtn = document.querySelector('.copy');
copyBtn?.addEventListener('click', async () => {
  const text = document.querySelector('.prompt-box code').innerText;
  try {
    await navigator.clipboard.writeText(text);
    showToast('Prompt copiado');
  } catch {
    showToast('Selecione o texto e copie manualmente');
  }
});
