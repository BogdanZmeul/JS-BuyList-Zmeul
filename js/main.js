document.addEventListener("DOMContentLoaded", () => {
    const initialProducts = [
        { name: "Помідори", count: 2, purchased: true },
        { name: "Печиво", count: 2, purchased: false },
        { name: "Сир", count: 1, purchased: false }
    ];

    const productList = document.querySelector(".products");

    createAddProductSection(productList);

    // Створення товарів
    initialProducts.forEach(product => {
        const productSection = createProductSection(product);
        productList.appendChild(productSection);

        updateSidebar(product);
    });
});

function createProductSection(product) {
    let { name, count, purchased } = product;
    const section = document.createElement("section");
    section.className = "products-section";

    const productElement = document.createElement("section");
    productElement.className = "product";

    const nameProduct = document.createElement("p");
    nameProduct.className = "name" + (purchased ? " purchased" : "");
    nameProduct.textContent = name;


    nameProduct.addEventListener("click", () => {
        updateNameProduct(nameProduct, product)
    });

    productElement.appendChild(nameProduct);

    const quantityDiv = document.createElement("div");
    quantityDiv.className = "quantity" + (purchased ? " no-buttons" : "");

    const countProduct = document.createElement("p");
    countProduct.className = "count";
    countProduct.textContent = count;
    quantityDiv.appendChild(countProduct);

    if (!purchased) {
        createQuantityButtons(quantityDiv, countProduct, product);
    }

    productElement.appendChild(quantityDiv);

    const actions = document.createElement("div");
    actions.className = "action-buttons";

    const purchaseBtn = createButton(purchased ? "Повернути" : "Купити", "purchase", purchased ? "Товар куплено" : "Товар не куплено");

    purchaseBtn.addEventListener("click", () => {
        purchased = !purchased;
        product.purchased = !product.purchased;

        nameProduct.classList.toggle("purchased", purchased);
        countProduct.classList.toggle("purchased", purchased);
        quantityDiv.classList.toggle("no-buttons", purchased);

        const removeBtn = actions.querySelector(".red.cross");
        if (removeBtn) {
            removeBtn.style.display = purchased ? "none" : "inline-block";
        } else if (!purchased) {
            createRemoveButton(actions, product, section);
        }

        const minusBtn = quantityDiv.querySelector(".red.round");
        const plusBtn = quantityDiv.querySelector(".green.round");
        if (minusBtn && plusBtn) {
            minusBtn.style.display = purchased ? "none" : "inline-block";
            plusBtn.style.display = purchased ? "none" : "inline-block";
        } else if (!purchased) {
            createQuantityButtons(quantityDiv, countProduct, product);
        }

        purchaseBtn.textContent = purchased ? "Повернути" : "Купити";
        purchaseBtn.setAttribute("data-tooltip", purchased ? "Товар куплено" : "Товар не куплено");

        removeFromSidebar(product.name);
        updateSidebar({ name: product.name, count: product.count, purchased: product.purchased });
    });

    actions.appendChild(purchaseBtn);

    if (!purchased) {
        createRemoveButton(actions, product, section);
    }

    productElement.appendChild(actions);

    section.appendChild(productElement);
    return section;
}

function createAddProductSection(productList) {
    const input = document.querySelector(".add-product-input");
    const addBtn = document.querySelector(".add-product");
    addBtn.addEventListener("click", () => addNewProduct(productList, input));

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addNewProduct(productList, input);
        }
    });
}

function addNewProduct(productList, input) {
    const newName = input.value.trim();
    if (newName === "") {
        alert("Назва товару не може бути порожньою!");
        input.focus();
        return;
    }

    const newProduct = { name: newName, count: 1, purchased: false };

    if (checkProductExists(newName)) {
        alert("Товар з такою назвою вже існує!");
        input.focus();
        return;
    }

    const newProductSection = createProductSection(newProduct);
    productList.appendChild(newProductSection);

    updateSidebar(newProduct);

    input.value = "";
    input.focus();
}

function createButton(text, classes, tooltip) {
    const btn = document.createElement("button");
    btn.className = `btn ${classes} tooltip`;
    btn.setAttribute("data-tooltip", tooltip);
    btn.textContent = text;
    return btn;
}

function createQuantityButtons(quantityDiv, countProduct, product) {
    const minusBtn = createButton("−", product.count == 1 ? "red round disabled" : "red round", "Прибрати 1 шт");
    minusBtn.addEventListener("click", () => {
        if (product.count > 1) {
            product.count--;
            countProduct.textContent = product.count;
        }
        minusBtn.classList.toggle("disabled", product.count == 1);
        updateSidebarCount(product.name, product.count);
    });
    quantityDiv.insertBefore(minusBtn, countProduct);

    const plusBtn = createButton("+", "green round", "Додати 1 шт");
    plusBtn.addEventListener("click", () => {
        product.count++;
        countProduct.textContent = product.count;
        minusBtn.classList.toggle("disabled", product.count == 1);
        updateSidebarCount(product.name, product.count);
    });
    quantityDiv.appendChild(plusBtn);
}

function createRemoveButton(actions, product, section) {
    const removeBtn = createButton("×", "red cross", "Видалити товар");

    removeBtn.addEventListener("click", () => {
        section.remove();
        removeFromSidebar(product.name);
    });

    actions.appendChild(removeBtn);
}

function updateNameProduct(nameProduct, product) {
    if (nameProduct.classList.contains("purchased")) {
        return;
    }

    const input = document.createElement("input");
    input.type = "text";
    input.value = nameProduct.textContent;
    input.className = "name-input";
    nameProduct.replaceWith(input);
    input.focus();

    input.addEventListener("blur", () => {
        const newName = input.value.trim();
        if (newName == product.name) {
            return;
        } else if (newName === "" || checkProductExists(newName)) {
            alert("Назва не може бути порожньою або вже існує!");
            input.value = product.name;
            input.focus();
            return;
        }

        nameProduct.textContent = newName;
        updateSidebarProductName(product.name, newName);
        product.name = newName;

        input.replaceWith(nameProduct);
    });
}

function updateSidebar({ name, count, purchased }) {
    const remainingList = document.querySelector(".remaining");
    const boughtList = document.querySelector(".bought");

    const li = document.createElement("li");
    li.className = "tag" + (purchased ? " purchased" : "");

    const tagTextSpan = document.createElement("span");
    tagTextSpan.className = "tag-text";
    tagTextSpan.textContent = name;

    const countSpan = document.createElement("span");
    countSpan.className = "count-circle" + (purchased ? " purchased" : "");
    countSpan.textContent = count;

    li.appendChild(tagTextSpan);
    li.appendChild(countSpan);

    if (purchased) {
        boughtList.appendChild(li);
    } else {
        remainingList.appendChild(li);
    }
}

function updateSidebarCount(name, count) {
    const allTags = document.querySelectorAll(".sidebar-statistics-section .tag");

    allTags.forEach(tag => {
        const tagName = tag.firstChild.textContent.trim().toLocaleLowerCase();
        if (tagName == name.trim().toLocaleLowerCase()) {
            const countCircle = tag.querySelector(".count-circle");
            countCircle.textContent = count;
        }
    });
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

function updateSidebarProductName(oldName, newName) {
    const allTags = document.querySelectorAll(".sidebar-statistics-section .tag");

    allTags.forEach(tag => {
        const tagName = tag.firstChild.textContent.trim().toLocaleLowerCase();
        if (tagName == oldName.trim().toLocaleLowerCase()) {
            tag.firstChild.textContent = newName;
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
