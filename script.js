const products = [
  {
    kicker: 'Mix tropical enchilado',
    name: 'Gomitas Tropicales',
  },
  {
    kicker: 'Fresa, cereza & chile',
    name: 'Corazones Locos',
  },
  {
    kicker: 'Ositos con limón y chile',
    name: 'Ositos Enchilados',
  },
  {
    kicker: 'Aros y corazones sour',
    name: 'Aros Ácidos',
  },
];

const scenes = [...document.querySelectorAll('.scene')];
const depthScenes = [...document.querySelectorAll('.scene-depth-image')];
const decorSets = [...document.querySelectorAll('.decor-set')];
const dots = [...document.querySelectorAll('.slide-dot')];
const productInfo = document.querySelector('.product-info');
const heroTitle = document.getElementById('hero-title');
const title = document.getElementById('product-title');
const kicker = document.getElementById('product-kicker');
const current = document.getElementById('slide-current');
const productPrice = document.getElementById('product-price');
const selectedSizeLabel = document.getElementById('selected-size');
const buyButton = document.getElementById('buy-button');
const previousButton = document.getElementById('previous-product');
const nextButton = document.getElementById('next-product');
const sizeDialog = document.getElementById('size-dialog');
const closeSizeDialog = document.getElementById('close-size-dialog');
const sizeOptions = [...document.querySelectorAll('input[name="cup-size"]')];
const sizeStep = document.getElementById('size-step');
const sauceStep = document.getElementById('sauce-step');
const cartStep = document.getElementById('cart-step');
const continueToSauces = document.getElementById('continue-to-sauces');
const backToSize = document.getElementById('back-to-size');
const sauceOptions = [...document.querySelectorAll('input[name="sauce"]')];
const extraSauce = document.getElementById('extra-sauce');
const orderSummary = document.getElementById('order-summary');
const progressLabel = document.getElementById('checkout-progress-label');
const progressBars = [...document.querySelectorAll('[data-progress-step]')];
const checkoutProgress = document.getElementById('checkout-progress');
const dialogEyebrow = document.getElementById('dialog-eyebrow');
const openCartButton = document.getElementById('open-cart');
const cartCount = document.getElementById('cart-count');
const cartItemsContainer = document.getElementById('cart-items');
const cartEmpty = document.getElementById('cart-empty');
const cartTotal = document.getElementById('cart-total');
const cartTotalValue = document.getElementById('cart-total-value');
const cartReminder = document.getElementById('cart-reminder');
const cartReminderText = document.getElementById('cart-reminder-text');
const sendCartWhatsapp = document.getElementById('send-cart-whatsapp');
const addToCartButton = document.getElementById('add-to-cart');
const continueShoppingButton = document.getElementById('continue-shopping');
const showcase = document.querySelector('.showcase');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let activeIndex = 2;
let rotationTimer;
let transitionTimer;
const cart = [];

function updateSelectedSize() {
  const selected = sizeOptions.find((option) => option.checked) ?? sizeOptions[1];
  const sizeName = selected.dataset.sizeName;
  const price = selected.value;
  const productName = products[activeIndex].name;

  productPrice.textContent = `$${price}`;
  selectedSizeLabel.textContent = `Vaso ${sizeName.toLowerCase()}`;
  orderSummary.textContent = `${productName} · Vaso ${sizeName.toLowerCase()} · $${price}`;
}

function updateCartCount() {
  const quantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = String(quantity);
  openCartButton.setAttribute('aria-label', `Carrito, ${quantity} ${quantity === 1 ? 'artículo' : 'artículos'}`);
  cartReminder.hidden = quantity === 0;
  cartReminderText.textContent = `Ya llevas ${quantity} ${quantity === 1 ? 'vaso' : 'vasos'} en el carrito`;
}

function setCheckoutStep(step) {
  const choosingSize = step === 1;
  const choosingSauces = step === 2;
  const viewingCart = step === 3;
  sizeStep.hidden = !choosingSize;
  sauceStep.hidden = !choosingSauces;
  cartStep.hidden = !viewingCart;
  sizeDialog.setAttribute('aria-labelledby', choosingSize ? 'size-title' : choosingSauces ? 'sauce-title' : 'cart-title');
  checkoutProgress.hidden = viewingCart;
  dialogEyebrow.textContent = viewingCart ? 'Gomi Locas · Tu pedido' : 'Tu mezcla, a tu medida';
  progressBars.forEach((bar) => {
    const active = Number(bar.dataset.progressStep) <= step;
    bar.classList.toggle('is-active', active);
  });
  if (!viewingCart) {
    progressLabel.textContent = `Paso ${step} de 2`;
    checkoutProgress.setAttribute('aria-label', `Paso ${step} de 2`);
  }
  (choosingSize ? sizeStep : choosingSauces ? sauceStep : cartStep).querySelector('h2').focus({ preventScroll: true });
}

function formatPrice(amount) {
  return `$${amount.toLocaleString('en-US')}`;
}

function renderCart() {
  cartItemsContainer.replaceChildren();
  const isEmpty = cart.length === 0;
  cartEmpty.hidden = !isEmpty;
  cartTotal.hidden = isEmpty;
  sendCartWhatsapp.hidden = isEmpty;

  if (isEmpty) {
    cartTotalValue.textContent = '$0';
    sendCartWhatsapp.href = 'https://wa.me/50586553628';
    updateCartCount();
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const messageLines = ['Hola, quiero hacer este pedido:'];

  cart.forEach((item, index) => {
    const productName = products[item.productIndex].name;
    const article = document.createElement('article');
    article.className = 'cart-item';

    const top = document.createElement('div');
    top.className = 'cart-item__top';
    const details = document.createElement('div');
    details.className = 'cart-item__details';
    const name = document.createElement('h3');
    name.className = 'cart-item__name';
    name.textContent = productName;
    const size = document.createElement('p');
    size.className = 'cart-item__size';
    size.textContent = `Vaso ${item.sizeName.toLowerCase()} · ${formatPrice(item.price)} c/u`;
    details.append(name, size);

    const remove = document.createElement('button');
    remove.className = 'cart-item__remove';
    remove.type = 'button';
    remove.setAttribute('aria-label', `Quitar ${productName} del carrito`);
    remove.textContent = '×';
    remove.addEventListener('click', () => {
      cart.splice(index, 1);
      renderCart();
    });
    top.append(details, remove);
    article.append(top);

    const sauceLabels = [...item.sauces];
    if (item.extra) sauceLabels.push(item.extra);
    const sauceText = sauceLabels.length ? `Salsas y extras: ${sauceLabels.join(', ')}` : 'Sin salsa';
    const sauceLine = document.createElement('p');
    sauceLine.className = 'cart-item__sauces';
    sauceLine.textContent = sauceText;
    article.append(sauceLine);

    const bottom = document.createElement('div');
    bottom.className = 'cart-item__bottom';
    const quantityControl = document.createElement('div');
    quantityControl.className = 'cart-quantity';
    const decrease = document.createElement('button');
    decrease.type = 'button';
    decrease.textContent = '−';
    decrease.setAttribute('aria-label', `Reducir cantidad de ${productName}`);
    decrease.disabled = item.quantity <= 1;
    decrease.addEventListener('click', () => {
      item.quantity -= 1;
      renderCart();
    });
    const quantity = document.createElement('span');
    quantity.setAttribute('aria-live', 'polite');
    quantity.textContent = String(item.quantity);
    const increase = document.createElement('button');
    increase.type = 'button';
    increase.textContent = '+';
    increase.setAttribute('aria-label', `Aumentar cantidad de ${productName}`);
    increase.addEventListener('click', () => {
      item.quantity += 1;
      renderCart();
    });
    quantityControl.append(decrease, quantity, increase);

    const subtotal = document.createElement('strong');
    subtotal.className = 'cart-item__subtotal';
    subtotal.textContent = formatPrice(item.price * item.quantity);
    bottom.append(quantityControl, subtotal);
    article.append(bottom);
    cartItemsContainer.append(article);

    messageLines.push(`${index + 1}. ${productName} — vaso ${item.sizeName.toLowerCase()} — ${formatPrice(item.price)} c/u × ${item.quantity} = ${formatPrice(item.price * item.quantity)}. ${sauceText}.`);
  });

  cartTotalValue.textContent = formatPrice(total);
  messageLines.push(`Total: ${formatPrice(total)}.`);
  sendCartWhatsapp.href = `https://wa.me/50586553628?text=${encodeURIComponent(messageLines.join('\n'))}`;
  updateCartCount();
}

function addConfiguredItemToCart() {
  const selected = sizeOptions.find((option) => option.checked) ?? sizeOptions[1];
  const sauces = sauceOptions.filter((option) => option.checked).map((option) => option.value);
  const extra = extraSauce.value.trim();
  const sizeName = selected.dataset.sizeName;
  const price = Number(selected.value);
  const id = JSON.stringify([activeIndex, sizeName, price, sauces, extra.toLowerCase()]);
  const existing = cart.find((item) => item.id === id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, productIndex: activeIndex, sizeName, price, sauces, extra, quantity: 1 });
  }
  renderCart();
  setCheckoutStep(3);
}

function showProduct(index) {
  const nextIndex = (index + products.length) % products.length;
  const changed = nextIndex !== activeIndex;
  if (changed) {
    window.clearTimeout(transitionTimer);
    showcase.classList.remove('is-transitioning');
    void showcase.offsetWidth;
  }
  activeIndex = nextIndex;
  showcase.dataset.slide = String(activeIndex);
  decorSets.forEach((set) => {
    set.classList.toggle('is-active', Number(set.dataset.decorSlide) === activeIndex);
  });
  const product = products[activeIndex];

  scenes.forEach((scene, sceneIndex) => {
    scene.classList.toggle('is-active', sceneIndex === activeIndex);
  });
  depthScenes.forEach((scene, sceneIndex) => {
    scene.classList.toggle('is-active', sceneIndex === activeIndex);
  });
  dots.forEach((dot, dotIndex) => {
    const isActive = dotIndex === activeIndex;
    dot.classList.toggle('is-active', isActive);
    dot.setAttribute('aria-pressed', String(isActive));
  });

  kicker.textContent = product.kicker;
  title.textContent = product.name;
  if (changed) {
    heroTitle.classList.remove('is-changing');
    void heroTitle.offsetWidth;
    heroTitle.classList.add('is-changing');
    productInfo.classList.remove('is-changing');
    void productInfo.offsetWidth;
    productInfo.classList.add('is-changing');
    if (!reduceMotion.matches) {
      showcase.classList.add('is-transitioning');
      transitionTimer = window.setTimeout(() => showcase.classList.remove('is-transitioning'), 1250);
    }
  }
  current.textContent = String(activeIndex + 1).padStart(2, '0');
  updateSelectedSize();
}

function startRotation() {
  window.clearInterval(rotationTimer);
  if (!reduceMotion.matches && !sizeDialog.open && !document.hidden) {
    rotationTimer = window.setInterval(() => showProduct(activeIndex + 1), 7600);
  }
}

function moveProduct(direction) {
  showProduct(activeIndex + direction);
  startRotation();
}

dots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    showProduct(index);
    startRotation();
  });
});

previousButton.addEventListener('click', () => moveProduct(-1));
nextButton.addEventListener('click', () => moveProduct(1));

window.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest('a, button, input, textarea, select, [contenteditable="true"]')) return;
  if (event.key === 'ArrowLeft') moveProduct(-1);
  if (event.key === 'ArrowRight') moveProduct(1);
});

buyButton.addEventListener('click', () => {
  window.clearInterval(rotationTimer);
  sauceOptions.forEach((option) => { option.checked = false; });
  extraSauce.value = '';
  updateSelectedSize();
  sizeDialog.showModal();
  setCheckoutStep(1);
});

closeSizeDialog.addEventListener('click', () => sizeDialog.close());
sizeOptions.forEach((option) => option.addEventListener('change', updateSelectedSize));
addToCartButton.addEventListener('click', addConfiguredItemToCart);
openCartButton.addEventListener('click', () => {
  window.clearInterval(rotationTimer);
  renderCart();
  sizeDialog.showModal();
  setCheckoutStep(3);
});
continueShoppingButton.addEventListener('click', () => setCheckoutStep(1));
cartReminder.addEventListener('click', () => {
  renderCart();
  setCheckoutStep(3);
});
continueToSauces.addEventListener('click', () => setCheckoutStep(2));
backToSize.addEventListener('click', () => setCheckoutStep(1));
sizeDialog.addEventListener('close', startRotation);

showcase.addEventListener('mouseenter', () => window.clearInterval(rotationTimer));
showcase.addEventListener('mouseleave', startRotation);
showcase.addEventListener('focusin', () => window.clearInterval(rotationTimer));
showcase.addEventListener('focusout', (event) => {
  if (!showcase.contains(event.relatedTarget) && !sizeDialog.open) startRotation();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) window.clearInterval(rotationTimer);
  else startRotation();
});
reduceMotion.addEventListener?.('change', startRotation);

updateSelectedSize();
updateCartCount();
startRotation();
