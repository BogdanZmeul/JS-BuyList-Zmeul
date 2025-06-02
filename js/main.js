const initialProducts = [
    { name: "Помідори", count: 2, purchased: true },
    { name: "Печиво", count: 2, purchased: false },
    { name: "Сир", count: 1, purchased: false }
];

const productList = document.querySelector(".products");
const remainingList = document.querySelector(".remaining");
const boughtList = document.querySelector(".bought");

// Очищаємо наявні продукти в HTML
const existingSections = document.querySelectorAll(".products-section");
existingSections.forEach((section, index) => {
    if (index > 0) section.remove();
});

// Створення товарів
initialProducts.forEach(product => {
    const productSection = createProductSection(product);
    productList.appendChild(productSection);

    updateSidebar(product);
});

const input = document.querySelector(".add-product-input");
const addBtn = document.querySelector(".add-product");

// Функція додавання нового товару
function addNewProduct() {
    const newName = input.value.trim();
    if (newName === "") return;

    const newProduct = { name: newName, count: 1, purchased: false };

    if (checkProductExists(newName)) {
        alert("Товар з такою назвою вже існує!");
        input.value = "";
        input.focus();
        return;
    }

    const newProductSection = createProductSection(newProduct);
    productList.appendChild(newProductSection);

    updateSidebar(newProduct);

    input.value = "";
    input.focus();
}

addBtn.addEventListener("click", addNewProduct);

input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        addNewProduct();
    }
});

function createProductSection({ name, count, purchased }) {
    const section = document.createElement("section");
    section.className = "products-section";

    const product = document.createElement("section");
    product.className = "product";

    const nameProduct = document.createElement("p");
    nameProduct.className = "name" + (purchased ? " purchased" : "");
    nameProduct.textContent = name;

    // Редагування при натисканні
    if (!purchased) {
        nameProduct.addEventListener("click", () => {
            updateNameProduct(nameProduct, name, count, purchased)
        });
    }

    product.appendChild(nameProduct);

    const quantityDiv = document.createElement("div");
    quantityDiv.className = "quantity" + (purchased ? " no-buttons" : "");

    const countProduct = document.createElement("p");
    countProduct.className = "count";
    countProduct.textContent = count;
    quantityDiv.appendChild(countProduct);

    if (!purchased) {
        createQuantityButtons(quantityDiv, count, countProduct);
    }

    product.appendChild(quantityDiv);

    const actions = document.createElement("div");
    actions.className = "action-buttons";

    const purchaseBtn = createButton(purchased ? "Зробити не купленим" : "Купити", "purchase", purchased ? "Товар куплено" : "Товар не куплено");

    purchaseBtn.addEventListener("click", () => {
        purchased = !purchased;

        nameProduct.classList.toggle("purchased", purchased);
        countProduct.classList.toggle("purchased", purchased);
        quantityDiv.classList.toggle("no-buttons", purchased);

        const removeBtn = actions.querySelector(".red.cross");
        if (removeBtn) {
            removeBtn.style.display = purchased ? "none" : "inline-block";
        } else if (!purchased) {
            createRemoveButton(actions, name, section);
        }

        const minusBtn = quantityDiv.querySelector(".red.round");
        const plusBtn = quantityDiv.querySelector(".green.round");
        if (minusBtn && plusBtn) {
            minusBtn.style.display = purchased ? "none" : "inline-block";
            plusBtn.style.display = purchased ? "none" : "inline-block";
        } else if (!purchased) {
            createQuantityButtons(quantityDiv, count, countProduct);
        }

        purchaseBtn.textContent = purchased ? "Зробити не купленим" : "Купити";
        purchaseBtn.setAttribute("data-tooltip", purchased ? "Товар куплено" : "Товар не куплено");

        removeFromSidebar(name);
        updateSidebar({ name, count, purchased });
    });

    actions.appendChild(purchaseBtn);

    if (!purchased) {
        createRemoveButton(actions, name, section);
    }

    product.appendChild(actions);

    section.appendChild(product);
    return section;
}

function createButton(text, classes, tooltip) {
    const btn = document.createElement("button");
    btn.className = `btn ${classes} tooltip`;
    btn.setAttribute("data-tooltip", tooltip);
    btn.textContent = text;
    return btn;
}

function createQuantityButtons(quantityDiv, count, countProduct) {
    const minusBtn = createButton("−", count == 1 ? "red round disabled" : "red round", "Прибрати 1 шт");
    minusBtn.addEventListener("click", () => {
        if (count > 1) {
            count--;
            countProduct.textContent = count;
        }
        minusBtn.classList.toggle("disabled", count == 1);
    });
    quantityDiv.insertBefore(minusBtn, countProduct);

    const plusBtn = createButton("+", "green round", "Додати 1 шт");
    plusBtn.addEventListener("click", () => {
        count++;
        countProduct.textContent = count;
        minusBtn.classList.toggle("disabled", count == 1);
    });
    quantityDiv.appendChild(plusBtn);
}

function createRemoveButton(actions, name, section) {
    const removeBtn = createButton("×", "red cross", "Видалити товар");

    removeBtn.addEventListener("click", () => {
        section.remove();
        removeFromSidebar(name);
    });

    actions.appendChild(removeBtn);
}

function updateNameProduct(nameProduct, name, count, purchased) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = nameProduct.textContent;
    input.className = "name-input";
    nameProduct.replaceWith(input);
    input.focus();

    // Заміна назад на текст при втраті фокуса
    input.addEventListener("blur", () => {
        const newName = input.value.trim();
        if (newName === "" || checkProductExists(newName)) {
            alert("Назва не може бути порожньою або вже існує!");
            input.value = name; // повернути стару назву
            input.focus(); // не дозволяти порожню назву
            return;
        }

        nameProduct.textContent = newName;

        removeFromSidebar(name);
        updateSidebar({ name: newName, count, purchased });

        input.replaceWith(nameProduct);

        name = newName;
    });
}

function updateSidebar({ name, count, purchased }) {
    const li = document.createElement("li");
    li.className = "tag" + (purchased ? " purchased" : "");
    li.innerHTML = `${name} <span class="count-circle${purchased ? " purchased" : ""}">${count}</span>`;

    if (purchased) {
        boughtList.appendChild(li);
    } else {
        remainingList.appendChild(li);
    }
}

function removeFromSidebar(name) {
    const allTags = document.querySelectorAll(".sidebar-statistics-section .tag");

    allTags.forEach(tag => {
        const tagName = tag.firstChild.textContent.trim().toLocaleLowerCase();
        if (tagName == name.trim().toLocaleLowerCase()) {
            tag.remove();
        }
    });
}

function checkProductExists(name) {
    const allProducts = document.querySelectorAll(".product .name");
    for (const product of allProducts) {
        if (product.textContent.trim().toLocaleLowerCase() == name.trim().toLocaleLowerCase()) {
            return true;
        }
    }
}
