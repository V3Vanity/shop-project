import {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct,
} from "./modules/data.js";

//   НАВИГАЦИЯ
document.getElementById("backToShopBtn").addEventListener("click", () => {
  window.location.href = "index.html";
});

//   МЕНЕДЖЕР МОДАЛОК
const ModalManager = {
  modals: {},
  currentModal: null,

  register(id) {
    this.modals[id] = {
      element: document.getElementById(id),
      isOpen: false,
    };
  },

  open(id) {
    const modal = this.modals[id];
    if (!modal) return;
    if (this.currentModal) this.close(this.currentModal);
    modal.element.style.display = "flex";
    modal.isOpen = true;
    this.currentModal = id;
    document.body.style.overflow = "hidden";
  },

  close(id) {
    const modal = this.modals[id];
    if (!modal || !modal.isOpen) return;
    modal.element.style.display = "none";
    modal.isOpen = false;
    this.currentModal = null;
    document.body.style.overflow = "";
  },

  closeCurrent() {
    if (this.currentModal) this.close(this.currentModal);
  },

  init() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.currentModal) {
        this.closeCurrent();
      }
    });

    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-overlay")) {
        this.close(e.target.id);
      }
    });

    document.querySelectorAll("[data-modal]").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.dataset.modal;
        if (this.dataset.action === "open") {
          ModalManager.open(id);
        } else {
          ModalManager.close(id);
        }
      });
    });
  },
};

ModalManager.register("addModal");
ModalManager.register("editModal");
ModalManager.init();

//   УПРАВЛЕНИЕ ВАРИАНТАМИ
const colorOptions = [
  "Космический оранжевый",
  "Серебристый",
  "Глубокий синий",
  "Черный",
  "Белый",
  "Красный",
  "Зеленый",
  "Желтый",
  "Розовый",
  "Фиолетовый",
];

const storageOptions = ["128 GB", "256 GB", "512 GB", "1 TB", "2 TB"];

let variantCounter = 0;
let editVariantCounter = 0;

// Функция добавления строки варианта (для добавления)
function addVariantRow() {
  const container = document.getElementById("variantsContainer");
  variantCounter++;

  const variantId = `variant_${variantCounter}`;

  const row = document.createElement("div");
  row.className = "variant-row";
  row.dataset.variantId = variantId;

  row.innerHTML = `
    <div class="variant-header">
      <span class="variant-number">Вариант ${variantCounter}</span>
      <button type="button" class="remove-variant-btn" data-variant-id="${variantId}">✕</button>
    </div>
    
    <div class="variant-fields">
      <div class="form-group">
        <label>Цвет</label>
        <select class="variant-color" required>
          <option value="">Выберите</option>
          ${colorOptions.map((c) => `<option value="${c}">${c}</option>`).join("")}
        </select>
      </div>
      
      <div class="form-group">
        <label>Память</label>
        <select class="variant-storage" required>
          <option value="">Выберите</option>
          ${storageOptions.map((s) => `<option value="${s}">${s}</option>`).join("")}
        </select>
      </div>
      
      <div class="form-group">
        <label>Цена</label>
        <input type="number" class="variant-price" placeholder="108490" required />
      </div>
      
      <div class="form-group">
        <label>Цена на заказ</label>
        <input type="number" class="variant-price-order" placeholder="101990" required />
      </div>
      
      <div class="form-group">
        <label>Количество</label>
        <input type="number" class="variant-quantity" placeholder="0" required min="0" />
      </div>
      
      <div class="form-group">
        <label>Изображение (опционально)</label>
        <input type="file" class="variant-image" accept="image/*" />
        <div class="variant-image-preview"></div>
      </div>
    </div>
  `;

  container.appendChild(row);

  // Обработка удаления варианта
  const removeBtn = row.querySelector(".remove-variant-btn");
  removeBtn.addEventListener("click", () => {
    if (container.children.length > 1) {
      row.remove();
      updateVariantNumbers();
    } else {
      alert("Должен быть хотя бы один вариант!");
    }
  });

  // Предпросмотр изображения варианта
  const imageInput = row.querySelector(".variant-image");
  const imagePreview = row.querySelector(".variant-image-preview");

  imageInput.addEventListener("change", function () {
    imagePreview.innerHTML = "";
    if (this.files && this.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.src = e.target.result;
        imagePreview.appendChild(img);
      };
      reader.readAsDataURL(this.files[0]);
    }
  });
}

// Функция добавления строки варианта (для редактирования)
function addEditVariantRow(variant = null) {
  const container = document.getElementById("editVariantsContainer");
  editVariantCounter++;

  const variantId = `edit_variant_${editVariantCounter}`;

  const row = document.createElement("div");
  row.className = "variant-row";
  row.dataset.variantId = variantId;

  row.innerHTML = `
    <div class="variant-header">
      <span class="variant-number">Вариант ${editVariantCounter}</span>
      <button type="button" class="remove-variant-btn" data-variant-id="${variantId}">✕</button>
    </div>
    
    <div class="variant-fields">
      <div class="form-group">
        <label>Цвет</label>
        <select class="variant-color" required>
          <option value="">Выберите</option>
          ${colorOptions.map((c) => `<option value="${c}" ${variant?.color === c ? "selected" : ""}>${c}</option>`).join("")}
        </select>
      </div>
      
      <div class="form-group">
        <label>Память</label>
        <select class="variant-storage" required>
          <option value="">Выберите</option>
          ${storageOptions.map((s) => `<option value="${s}" ${variant?.storage === s ? "selected" : ""}>${s}</option>`).join("")}
        </select>
      </div>
      
      <div class="form-group">
        <label>Цена</label>
        <input type="number" class="variant-price" value="${variant?.price || ""}" placeholder="108490" required />
      </div>
      
      <div class="form-group">
        <label>Цена на заказ</label>
        <input type="number" class="variant-price-order" value="${variant?.priceToOrder || ""}" placeholder="101990" required />
      </div>
      
      <div class="form-group">
        <label>Количество</label>
        <input type="number" class="variant-quantity" value="${variant?.quantity || 0}" placeholder="0" required min="0" />
      </div>
      
      <div class="form-group">
        <label>Изображение (опционально)</label>
        <input type="file" class="variant-image" accept="image/*" />
        <div class="variant-image-preview">
          ${variant?.image ? `<img src="${variant.image}" />` : ""}
        </div>
      </div>
    </div>
  `;

  container.appendChild(row);

  // Обработка удаления варианта
  const removeBtn = row.querySelector(".remove-variant-btn");
  removeBtn.addEventListener("click", () => {
    if (container.children.length > 1) {
      row.remove();
      updateEditVariantNumbers();
    } else {
      alert("Должен быть хотя бы один вариант!");
    }
  });

  // Предпросмотр изображения варианта
  const imageInput = row.querySelector(".variant-image");
  const imagePreview = row.querySelector(".variant-image-preview");

  imageInput.addEventListener("change", function () {
    imagePreview.innerHTML = "";
    if (this.files && this.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.src = e.target.result;
        imagePreview.appendChild(img);
      };
      reader.readAsDataURL(this.files[0]);
    }
  });
}

// Обновление номеров вариантов (добавление)
function updateVariantNumbers() {
  const rows = document.querySelectorAll(".variant-row");
  rows.forEach((row, index) => {
    row.querySelector(".variant-number").textContent = `Вариант ${index + 1}`;
  });
}

// Обновление номеров вариантов (редактирование)
function updateEditVariantNumbers() {
  const rows = document.querySelectorAll("#editVariantsContainer .variant-row");
  rows.forEach((row, index) => {
    row.querySelector(".variant-number").textContent = `Вариант ${index + 1}`;
  });
}

// Добавление первой строки варианта при открытии модалки добавления
document
  .getElementById("addVariantBtn")
  .addEventListener("click", addVariantRow);

// Добавление первой строки варианта при открытии модалки редактирования
document.getElementById("editAddVariantBtn").addEventListener("click", () => {
  addEditVariantRow();
});

// ПРЕДПРОСМОТР ОСНОВНОГО ИЗОБРАЖЕНИЯ
document.getElementById("productImage").addEventListener("change", function () {
  const preview = document.getElementById("imagePreview");
  preview.innerHTML = "";
  if (this.files && this.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.src = e.target.result;
      preview.appendChild(img);
    };
    reader.readAsDataURL(this.files[0]);
  }
});

// ДОБАВЛЕНИЕ ТОВАРА
document.getElementById("addProductForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("productName").value.trim();
  const category = document.getElementById("productCategory").value;
  const imageInput = document.getElementById("productImage");
  const imageFile = imageInput.files[0];

  if (!name || !category || !imageFile) {
    alert("Заполните название, категорию и основное изображение!");
    return;
  }

  // Собираем варианты
  const variantRows = document.querySelectorAll(".variant-row");
  const variants = [];

  for (const row of variantRows) {
    const color = row.querySelector(".variant-color").value;
    const storage = row.querySelector(".variant-storage").value;
    const price = parseFloat(row.querySelector(".variant-price").value);
    const priceToOrder = parseFloat(
      row.querySelector(".variant-price-order").value,
    );
    const quantity =
      parseInt(row.querySelector(".variant-quantity").value) || 0;
    const variantImageInput = row.querySelector(".variant-image");
    const variantImageFile = variantImageInput.files[0];

    if (!color || !storage || !price) {
      alert("Заполните все поля вариантов (цвет, память, цена)!");
      return;
    }

    variants.push({
      id: `variant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      color,
      storage,
      price,
      priceToOrder,
      quantity,
      image: variantImageFile ? null : null,
    });
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    const mainImage = event.target.result;

    const variantPromises = [];

    variants.forEach((variant, index) => {
      const variantImageInput =
        document.querySelectorAll(".variant-image")[index];
      const variantImageFile = variantImageInput.files[0];

      if (variantImageFile) {
        const variantReader = new FileReader();
        variantPromises.push(
          new Promise((resolve) => {
            variantReader.onload = (e) => {
              variant.image = e.target.result;
              resolve();
            };
            variantReader.readAsDataURL(variantImageFile);
          }),
        );
      } else {
        variant.image = mainImage;
      }
    });

    Promise.all(variantPromises).then(() => {
      const newProduct = {
        id: Date.now(),
        name,
        category,
        variants,
      };

      addProduct(newProduct);

      // Сброс формы
      document.getElementById("addProductForm").reset();
      document.getElementById("imagePreview").innerHTML = "";
      document.getElementById("variantsContainer").innerHTML = "";
      variantCounter = 0;

      // Добавляем первую строку варианта
      addVariantRow();

      ModalManager.close("addModal");
      renderAdminProducts();
      alert("✅ Товар добавлен!");
    });
  };

  reader.readAsDataURL(imageFile);
});

// РЕНДЕР АДМИНКИ
function renderAdminProducts() {
  const container = document.getElementById("adminProductList");
  const products = getProducts();

  if (products.length === 0) {
    container.innerHTML = `<p class="empty-message">Товаров пока нет. Добавьте первый!</p>`;
    return;
  }

  container.innerHTML = products
    .map((product) => {
      const variant = product.variants[0];
      return `
      <div class="admin-product-item" data-id="${product.id}">
        <div class="info">
          <img src="${variant?.image || ""}" alt="${product.name}" />
          <div>
            <div class="name">${product.name}</div>
            <div class="details">${product.category} • ${product.variants.length} вариант(ов)</div>
          </div>
        </div>
        <div class="actions">
          <button class="edit-btn" data-id="${product.id}">✏️</button>
          <button class="delete-btn" data-id="${product.id}">🗑️</button>
        </div>
      </div>
    `;
    })
    .join("");
}

// УДАЛЕНИЕ
document.addEventListener("click", (e) => {
  const deleteBtn = e.target.closest(".delete-btn");
  if (deleteBtn) {
    const id = Number(deleteBtn.dataset.id);
    if (confirm("Удалить товар?")) {
      deleteProduct(id);
      renderAdminProducts();
    }
  }

  const editBtn = e.target.closest(".edit-btn");
  if (editBtn) {
    const id = Number(editBtn.dataset.id);
    const product = getProducts().find((p) => p.id === id);
    if (product) {
      // Заполняем форму редактирования
      document.getElementById("editProductName").value = product.name;
      document.getElementById("editProductCategory").value = product.category;
      document.getElementById("editProductForm").dataset.id = id;

      // Очищаем контейнер вариантов
      const container = document.getElementById("editVariantsContainer");
      container.innerHTML = "";
      editVariantCounter = 0;

      // Добавляем все варианты товара
      product.variants.forEach((variant) => {
        addEditVariantRow(variant);
      });

      ModalManager.open("editModal");
    }
  }
});

// СОХРАНЕНИЕ РЕДАКТИРОВАНИЯ
document.getElementById("editProductForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const id = Number(e.target.dataset.id);
  const name = document.getElementById("editProductName").value.trim();
  const category = document.getElementById("editProductCategory").value;

  if (!name || !category) {
    alert("Заполните название и категорию!");
    return;
  }

  // Собираем все варианты
  const variantRows = document.querySelectorAll(
    "#editVariantsContainer .variant-row",
  );
  const variants = [];

  for (const row of variantRows) {
    const color = row.querySelector(".variant-color").value;
    const storage = row.querySelector(".variant-storage").value;
    const price = parseFloat(row.querySelector(".variant-price").value);
    const priceToOrder = parseFloat(
      row.querySelector(".variant-price-order").value,
    );
    const quantity =
      parseInt(row.querySelector(".variant-quantity").value) || 0;
    const variantImageInput = row.querySelector(".variant-image");
    const variantImageFile = variantImageInput.files[0];
    const existingImage = row.querySelector(".variant-image-preview img")?.src;

    if (!color || !storage || !price) {
      alert("Заполните все поля вариантов (цвет, память, цена)!");
      return;
    }

    variants.push({
      id: `variant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      color,
      storage,
      price,
      priceToOrder,
      quantity,
      image: variantImageFile ? null : existingImage || "",
    });
  }

  const product = getProducts().find((p) => p.id === id);
  if (product) {
    // Обработка изображений вариантов
    const variantPromises = [];

    variants.forEach((variant, index) => {
      const variantImageInput = document.querySelectorAll(
        "#editVariantsContainer .variant-image",
      )[index];
      const variantImageFile = variantImageInput.files[0];

      if (variantImageFile) {
        const variantReader = new FileReader();
        variantPromises.push(
          new Promise((resolve) => {
            variantReader.onload = (e) => {
              variant.image = e.target.result;
              resolve();
            };
            variantReader.readAsDataURL(variantImageFile);
          }),
        );
      }
    });

    Promise.all(variantPromises).then(() => {
      const updatedProduct = {
        ...product,
        name,
        category,
        variants,
      };

      updateProduct(id, updatedProduct);
      ModalManager.close("editModal");
      renderAdminProducts();
      alert("✅ Товар обновлён!");
    });
  }
});

//   ЗАПУСК
renderAdminProducts();
addVariantRow(); // Добавляем первую строку варианта
