// ============================================
// data.js — управление товарами в localStorage
// ============================================

let products = [];

// Загрузка при старте
const saved = localStorage.getItem("products");
if (saved) {
  try {
    products = JSON.parse(saved);
  } catch {
    products = [];
  }
}

// Получить все товары
export function getProducts() {
  return products;
}

// Получить уникальные товары (группировка по названию)
export function getUniqueProducts() {
  const uniqueMap = new Map();

  products.forEach((product) => {
    const key = product.name.toLowerCase();
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, {
        ...product,
        variants: [...product.variants],
      });
    } else {
      // Объединяем варианты
      const existing = uniqueMap.get(key);
      existing.variants = [...existing.variants, ...product.variants];
    }
  });

  return Array.from(uniqueMap.values());
}

// Добавить товар с несколькими вариантами
export function addProduct(product) {
  // Проверяем, есть ли товар с таким названием
  const existingIndex = products.findIndex(
    (p) => p.name.toLowerCase() === product.name.toLowerCase(),
  );

  if (existingIndex !== -1) {
    // Если товар существует, добавляем только НОВЫЕ варианты
    const existingProduct = products[existingIndex];

    // Проверяем каждый вариант нового товара
    product.variants.forEach((newVariant) => {
      // Проверяем, есть ли уже такой вариант (цвет + память)
      const variantExists = existingProduct.variants.some(
        (v) => v.color === newVariant.color && v.storage === newVariant.storage,
      );

      // Если такого варианта нет, добавляем его
      if (!variantExists) {
        existingProduct.variants.push(newVariant);
      }
    });

    localStorage.setItem("products", JSON.stringify(products));
    return existingProduct;
  } else {
    // Если товара нет, добавляем новый
    products.push(product);
    localStorage.setItem("products", JSON.stringify(products));
    return product;
  }
}

// Удалить товар по id
export function deleteProduct(id) {
  products = products.filter((p) => p.id !== id);
  localStorage.setItem("products", JSON.stringify(products));
  return products;
}

// Обновить товар (полная замена)
export function updateProduct(id, updatedData) {
  const index = products.findIndex((p) => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...updatedData };
    localStorage.setItem("products", JSON.stringify(products));
  }
  return products;
}

// Добавить вариант к товару
export function addVariant(productId, variant) {
  const product = products.find((p) => p.id === productId);
  if (product) {
    product.variants.push(variant);
    localStorage.setItem("products", JSON.stringify(products));
  }
  return products;
}

// Удалить вариант из товара
export function deleteVariant(productId, variantIndex) {
  const product = products.find((p) => p.id === productId);
  if (product && product.variants[variantIndex]) {
    product.variants.splice(variantIndex, 1);
    localStorage.setItem("products", JSON.stringify(products));
  }
  return products;
}

// Очистить все товары (для тестирования)
export function clearAllProducts() {
  products = [];
  localStorage.setItem("products", JSON.stringify(products));
  return products;
}
