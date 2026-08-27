import { getUniqueProducts, getProducts } from "./modules/data.js";

//   ПЕРЕХОД В АДМИНКУ
document.getElementById("adminBtn").addEventListener("click", () => {
  window.location.href = "admin.html";
});

// ОТКРЫТИЕ/ЗАКРЫТИЕ КАТАЛОГА
const catalogToggle = document.getElementById("catalogToggle");
const catalogMenu = document.getElementById("catalogMenu");

catalogToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  catalogMenu.classList.toggle("open");
});

document.addEventListener("click", () => {
  catalogMenu.classList.remove("open");
});

//  ФИЛЬТРАЦИЯ
let currentCategory = "all";

document.querySelectorAll("#catalogMenu li").forEach((item) => {
  item.addEventListener("click", () => {
    document
      .querySelectorAll("#catalogMenu li")
      .forEach((li) => li.classList.remove("active"));
    item.classList.add("active");
    currentCategory = item.dataset.category;
    renderProducts();
    catalogMenu.classList.remove("open");
  });
});

//  РЕНДЕР ТОВАРОВ
function renderProducts() {
  const container = document.getElementById("products");
  const allProducts = getUniqueProducts();

  let filtered = allProducts;
  if (currentCategory !== "all") {
    filtered = allProducts.filter((p) => p.category === currentCategory);
  }

  if (filtered.length === 0) {
    container.innerHTML = `<p class="empty-message">${allProducts.length === 0 ? "📭 Товаров пока нет. Загрузите первый в админке!" : "📭 В этой категории пока нет товаров"}</p>`;
    return;
  }

  container.innerHTML = filtered
    .map((product) => {
      // Группируем варианты по памяти
      const storageGroups = {};

      product.variants.forEach((variant, idx) => {
        if (!storageGroups[variant.storage]) {
          storageGroups[variant.storage] = [];
        }
        storageGroups[variant.storage].push({ variant, idx });
      });

      // Создаём кнопки памяти (уникальные)
      const storageButtons = Object.keys(storageGroups)
        .map((storage, storageIdx) => {
          const hasStock = storageGroups[storage].some(
            ({ variant }) => variant.quantity > 0,
          );

          return `<button class="storage-btn ${storageIdx === 0 ? "active" : ""}" 
            data-storage="${storage}"
            data-storage-index="${storageIdx}"
            ${!hasStock ? "disabled" : ""}>
            ${storage}
          </button>`;
        })
        .join("");

      // Создаём кнопки цвета для первой активной памяти
      const firstStorage = Object.keys(storageGroups)[0];
      const firstStorageVariants = storageGroups[firstStorage] || [];

      const colorOptions = firstStorageVariants
        .map(
          ({ variant, idx }) => `
          <button class="color-option-btn ${idx === firstStorageVariants[0]?.idx ? "selected" : ""}" 
            data-variant="${idx}" 
            style="background: ${getColorHex(variant.color)}"
            title="${variant.color}"
            data-quantity="${variant.quantity}"
            ${variant.quantity === 0 ? "disabled" : ""}>
          </button>`,
        )
        .join("");

      const firstVariant = product.variants[0];
      const isOutOfStock = firstVariant?.quantity === 0;
      const priceClass = isOutOfStock ? "price-out-of-stock" : "";
      const buttonClass = isOutOfStock ? "btn-cart disabled" : "btn-cart";

      return `
      <div class="product-card" data-product-id="${product.id}">
        <img class="product-card-image" src="${firstVariant?.image || ""}" alt="${product.name}" data-main-image />
        <div class="product-card-name">${product.name}</div>
        <div class="product-card-category">${product.category}</div>
        
        <div class="selected-color-name">${firstVariant?.color || ""}</div>
        
        <div class="variant-selector">
          <div class="color-picker">
            ${colorOptions}
          </div>
          <div class="storage-picker">
            ${storageButtons}
          </div>
        </div>
        
        <div class="product-card-price-block">
          <div class="product-card-price ${priceClass}" data-price="${firstVariant?.price || 0}">
            ${isOutOfStock ? '<span class="out-of-stock-label">Нет в наличии</span>' : `${formatPrice(firstVariant?.price)} ₽`}
          </div>
          <div class="product-card-price-order">
            <span class="price-order-label">Цена на заказ</span>
            <span class="price-order-value">${formatPrice(firstVariant?.priceToOrder)} ₽</span>
          </div>
        </div>
        
        <div class="product-card-actions">
          <button class="btn-details" data-id="${product.id}">Подробнее</button>
          <button class="${buttonClass}" data-id="${product.id}" data-variant="${firstVariant ? product.variants.indexOf(firstVariant) : 0}" ${isOutOfStock ? "disabled" : ""}>
            ${isOutOfStock ? "Нет в наличии" : "В корзину"}
          </button>
        </div>
      </div>
    `;
    })
    .join("");
}

// Функция форматирования цены
function formatPrice(price) {
  if (!price) return "0";
  return price.toLocaleString("ru-RU");
}

// Функция для получения hex-кода цвета
function getColorHex(colorName) {
  const colorMap = {
    "Космический оранжевый": "#ff6b35",
    Серебристый: "#c0c0c0",
    "Глубокий синий": "#1a2a6c",
    Черный: "#1a1a1a",
    Белый: "#f5f5f5",
    Красный: "#ef3124",
    Зеленый: "#4caf50",
    Желтый: "#ffc107",
    Розовый: "#ff69b4",
    Фиолетовый: "#9c27b0",
    Титан: "#a8a8a8",
    "Натуральный титан": "#b0b0b0",
    Голубой: "#2196f3",
    Оранжевый: "#ff9800",
  };
  return colorMap[colorName] || "#cccccc";
}

// Функция для обновления картинки и цен
function updateProductInfo(card, variantIndex) {
  const productName = card.querySelector(".product-card-name").textContent;
  const products = getUniqueProducts();
  const product = products.find((p) => p.name === productName);

  if (!product || !product.variants[variantIndex]) return;

  const variant = product.variants[variantIndex];
  const mainImage = card.querySelector("[data-main-image]");

  // Проверяем наличие товара
  if (variant.quantity === 0) {
    return;
  }

  // Плавная смена картинки
  if (mainImage) {
    mainImage.style.opacity = "0";

    setTimeout(() => {
      if (variant.image) {
        mainImage.src = variant.image;
      }
      mainImage.style.opacity = "1";
    }, 200);
  }

  // Обновляем цену
  const priceElement = card.querySelector(".product-card-price");
  if (priceElement && variant.price) {
    priceElement.textContent = `${formatPrice(variant.price)} ₽`;
    priceElement.dataset.price = variant.price;
    priceElement.classList.remove("price-out-of-stock");
  }

  // Обновляем цену на заказ
  const priceOrderElement = card.querySelector(".price-order-value");
  if (priceOrderElement && variant.priceToOrder) {
    priceOrderElement.textContent = `${formatPrice(variant.priceToOrder)} ₽`;
  }

  // Обновляем название цвета
  const colorNameElement = card.querySelector(".selected-color-name");
  if (colorNameElement) {
    colorNameElement.textContent = variant.color;
  }

  // Обновляем кнопку корзины
  const cartBtn = card.querySelector(".btn-cart");
  if (cartBtn) {
    cartBtn.dataset.variant = variantIndex;
    cartBtn.classList.remove("disabled");
    cartBtn.disabled = false;
    cartBtn.textContent = "В корзину";
  }
}

// Функция для отображения "Нет в наличии"
function showOutOfStock(card) {
  const priceElement = card.querySelector(".product-card-price");
  const cartBtn = card.querySelector(".btn-cart");

  priceElement.innerHTML =
    '<span class="out-of-stock-label">Нет в наличии</span>';
  priceElement.classList.add("price-out-of-stock");

  cartBtn.textContent = "Нет в наличии";
  cartBtn.classList.add("disabled");
  cartBtn.disabled = true;
}

// ОБРАБОТКА ВЫБОРА ВАРИАНТОВ
document.addEventListener("click", (e) => {
  // Выбор цвета
  const colorBtn = e.target.closest(".color-option-btn");
  if (colorBtn) {
    if (colorBtn.disabled) return;

    const card = colorBtn.closest(".product-card");
    const variantIndex = Number(colorBtn.dataset.variant);
    const productName = card.querySelector(".product-card-name").textContent;
    const product = getUniqueProducts().find((p) => p.name === productName);

    if (!product || !product.variants[variantIndex]) return;

    const variant = product.variants[variantIndex];

    if (variant.quantity === 0) {
      showOutOfStock(card);
      return;
    }

    // Обновляем выбор цвета
    card.querySelectorAll(".color-option-btn").forEach((btn) => {
      btn.classList.remove("selected");
    });
    colorBtn.classList.add("selected");

    // Обновляем все данные
    updateProductInfo(card, variantIndex);
  }

  // Выбор памяти
  const storageBtn = e.target.closest(".storage-btn");
  if (storageBtn) {
    if (storageBtn.disabled) return;

    const card = storageBtn.closest(".product-card");
    const productName = card.querySelector(".product-card-name").textContent;
    const product = getUniqueProducts().find((p) => p.name === productName);

    if (!product) return;

    const selectedStorage = storageBtn.dataset.storage;

    // Находим текущий выбранный цвет
    const selectedColorBtn = card.querySelector(".color-option-btn.selected");
    const currentColor = selectedColorBtn ? selectedColorBtn.title : "";

    // Находим варианты с выбранной памятью
    const storageVariants = product.variants
      .map((variant, idx) => ({ variant, idx }))
      .filter(({ variant }) => variant.storage === selectedStorage);

    if (storageVariants.length === 0) return;

    // Пытаемся найти вариант с текущим цветом
    let targetVariant = storageVariants.find(
      ({ variant }) => variant.color === currentColor && variant.quantity > 0,
    );

    // Если нет варианта с текущим цветом, берём первый доступный
    if (!targetVariant) {
      targetVariant =
        storageVariants.find(({ variant }) => variant.quantity > 0) ||
        storageVariants[0];
    }

    // Обновляем выбор памяти
    card.querySelectorAll(".storage-btn").forEach((btn) => {
      btn.classList.toggle("active", btn === storageBtn);
    });

    // Обновляем кнопки цветов для выбранной памяти
    const colorPicker = card.querySelector(".color-picker");
    colorPicker.innerHTML = storageVariants
      .map(
        ({ variant, idx }) => `
        <button class="color-option-btn ${idx === targetVariant.idx ? "selected" : ""}" 
          data-variant="${idx}" 
          style="background: ${getColorHex(variant.color)}"
          title="${variant.color}"
          data-quantity="${variant.quantity}"
          ${variant.quantity === 0 ? "disabled" : ""}>
        </button>`,
      )
      .join("");

    // Обновляем все данные для выбранного варианта
    updateProductInfo(card, targetVariant.idx);
  }
});

// КОРЗИНА
let cart = [];
const cartCount = document.getElementById("cartCount");
const cartModal = document.getElementById("cartModal");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");

// Загрузка корзины из localStorage
const savedCart = localStorage.getItem("cart");
if (savedCart) {
  try {
    cart = JSON.parse(savedCart);
  } catch {
    cart = [];
  }
}

// Функция обновления счётчика корзины
function updateCartCounter() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
  cartCount.style.display = totalItems > 0 ? "inline" : "none";
}

// Функция добавления в корзину
function addToCart(productId, variantIndex) {
  const products = getUniqueProducts();
  const product = products.find((p) => p.id === productId);

  if (!product || !product.variants[variantIndex]) return;

  const variant = product.variants[variantIndex];

  // Проверяем наличие
  if (variant.quantity === 0) {
    showToast("❌ Товар нет в наличии!");
    return;
  }

  // Создаём уникальный ключ для товара (название + цвет + хранилище)
  const cartItemId = `${product.id}_${variant.color}_${variant.storage}`;

  const existing = cart.find((item) => item.cartId === cartItemId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      cartId: cartItemId,
      id: product.id,
      name: product.name,
      category: product.category,
      price: variant.price || 0,
      image: variant.image || "",
      color: variant.color,
      storage: variant.storage,
      quantity: 1,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCounter();
  showToast("✅ Товар добавлен в корзину!");
}

// Функция удаления из корзины
function removeFromCart(cartItemId) {
  cart = cart.filter((item) => item.cartId !== cartItemId);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCounter();
  renderCart();
  showToast("🗑️ Товар удалён из корзины");
}

// Функция изменения количества
function changeQuantity(cartItemId, delta) {
  const item = cart.find((item) => item.cartId === cartItemId);
  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {
    removeFromCart(cartItemId);
    return;
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCounter();
  renderCart();
}

// Функция отображения корзины
function renderCart() {
  if (cart.length === 0) {
    cartItems.innerHTML = `<p class="empty-cart">🛒 Корзина пуста</p>`;
    cartTotal.textContent = "Итого: 0 ₽";
    return;
  }

  cartItems.innerHTML = cart
    .map(
      (item) => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-image" />
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-variants">
            <span class="variant-badge">🎨 ${item.color}</span>
            <span class="variant-badge">💾 ${item.storage}</span>
          </div>
          <div class="cart-item-price">${formatPrice(item.price)} ₽</div>
        </div>
        <div class="cart-item-quantity">
          <button class="qty-btn" onclick="changeQuantity('${item.cartId}', -1)">−</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn" onclick="changeQuantity('${item.cartId}', 1)">+</button>
        </div>
        <div class="cart-item-total">${formatPrice(item.price * item.quantity)} ₽</div>
        <button class="remove-btn" onclick="removeFromCart('${item.cartId}')">✕</button>
      </div>
    `,
    )
    .join("");

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = `Итого: ${formatPrice(total)} ₽`;

  // Сохраняем функции в глобальную область
  window.changeQuantity = changeQuantity;
  window.removeFromCart = removeFromCart;
}

// Функция очистки корзины
function clearCart() {
  cart = [];
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCounter();
  renderCart();
  showToast("🗑️ Корзина очищена");
}

// Функция оформления заказа
function checkout() {
  if (cart.length === 0) {
    showToast("❌ Корзина пуста!");
    return;
  }

  const order = {
    id: Date.now(),
    items: cart,
    total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    date: new Date().toLocaleString("ru-RU"),
  };

  // Сохраняем заказ в localStorage
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  orders.push(order);
  localStorage.setItem("orders", JSON.stringify(orders));

  showToast("✅ Заказ оформлен! Мы свяжемся с вами.");
  clearCart();
}

// Функция показа уведомления
function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

//  ОТКРЫТИЕ/ЗАКРЫТИЕ КОРЗИНЫ
document.getElementById("cartBtn").addEventListener("click", () => {
  renderCart();
  cartModal.style.display = "flex";
  document.body.style.overflow = "hidden";
});

document.getElementById("closeCartBtn").addEventListener("click", () => {
  cartModal.style.display = "none";
  document.body.style.overflow = "";
});

// Закрытие по клику на фон
cartModal.addEventListener("click", (e) => {
  if (e.target === cartModal) {
    cartModal.style.display = "none";
    document.body.style.overflow = "";
  }
});

// Закрытие по Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && cartModal.style.display === "flex") {
    cartModal.style.display = "none";
    document.body.style.overflow = "";
  }
});

// ОБРАБОТЧИКИ СОБЫТИЙ
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-cart");
  if (btn && !btn.disabled) {
    const productId = Number(btn.dataset.id);
    const variantIndex = Number(btn.dataset.variant) || 0;
    addToCart(productId, variantIndex);
  }
});

document.getElementById("checkoutBtn").addEventListener("click", checkout);
document.getElementById("clearCartBtn").addEventListener("click", clearCart);

//  ЗАПУСК
updateCartCounter();
renderProducts();
