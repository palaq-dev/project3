let products = [];

window.addEventListener('load', function () {
    // jQuery efekti
    document.querySelector('.loading-screen').style.display = "none";
    $('h2, h5, p').hide().delay(500).fadeIn(2000).delay(5000);
    $('a, button').hover(function () {
        $(this).css('transform', 'scale(1.1)');
    }, function () {
        $(this).css('transform', 'scale(1)');
    });
    $('.about-avatar img').animate({
        opacity: '0.3'
    }, 1000);
    $('.about-avatar img').animate({
        opacity: '1'
    }, 1000);
    $('.carousel-inner img').animate({
        opacity: '0.3'
    }, 1000);
    $('.carousel-inner img').animate({
        opacity: '1'
    }, 1000);

    if (window.location.pathname.endsWith("/order-items.html")) {
        fetchData("products", populateCart);
    }

    if (window.location.pathname.endsWith("/index.html") || window.location.pathname.endsWith("/")) {
        let showSuccessfullOrderModal = localStorage.getItem('showSuccessfullOrderModal');
        if (showSuccessfullOrderModal) {
            $('#orderSuccessfullyCreatedModal').modal('show');
            localStorage.clear();
        }

        fetchData("slider", populateSlider);
        fetchData("testimonials", populateReviews);
    }

    if (window.location.pathname.endsWith("/shop.html")) {
        fetchData("products", populateShop);
    }

    fetchData("social-media-footer", populateSocialMedia);
    fetchData("navigation-footer", populateNavigationFooter);

    // Filtriranje i sortiranje
    $("#category-filter").change(() => {
        fetchData("products", populateShop);
    })
    $("#rating-filter").change(() => {
        fetchData("products", populateShop);
    })
    $("#sort-by").change(() => {
        fetchData("products", populateShop);
    })

    refreshProductNumber();
});

// Ova funkcija koristi AJAX zahtev kako bi dobavila podatke iz JSON fajla na serveru
function fetchData(fileName, callback) {
    $.ajax({
        url: "assets/json/" + fileName + ".json",
        method: "get",
        datatype: "json",
        success: function (data) {
            callback(data);
        },
        error: function (xhr) { console.log(xhr); }
    })
}

// Ova funkcija generiše HTML kod za pravljenje slajdera sa proizvodima
function populateSlider(products) {
    let sliderDiv = document.getElementById("sliderDiv");
    sliderDiv.innerHTML = products.map(product =>
        `<div class="carousel-item ${products[0] == product ? "active" : " "}">
            <img src="${product.src}" class="d-block w-100" alt="${product.alt}" />
        </div> `).join(" ");

}

// Funkcija koja generiše HTML kod za prikazivanje testimonijala
function populateReviews(testimonials) {
    let testimonialsDiv = document.getElementById("testimonialsDiv")
    testimonialsDiv.innerHTML = testimonials.map(testimonial => `<div class="col-md-4">
    <div class="card p-3 text-center px-4">
        <div class="user-image">
            <img src="${testimonial.image}" alt="${testimonial.alt}" class="full-circle" />
        </div>
        <div class="user-content">
            <h5 class="mb-0">${testimonial.name}</h5>
            <span>${testimonial.position}</span>
            <p>${testimonial.text}</p>
        </div>
    </div>
</div>`).join(" ");

}

// Funkcija koja generiše HTML kod za prikazivanje ikona društvenih mreža
function populateSocialMedia(socialMedias) {
    let socialMediaUl = document.getElementById("socialMediaUl");
    socialMediaUl.innerHTML = socialMedias.map(socialMedia => `<li><a class="${socialMedia.class}" id="${socialMedia.id}" href="${socialMedia.href}" role="button"><i
                                                                class="${socialMedia.icon}"></i>&nbsp;${socialMedia.text}</a></li>`).join(" ");
}

// Funkcija koja generiše HTML kod za prikazivanje stavki navigacionog menija u podnožju stranice
function populateNavigationFooter(navigationFooterItems) {
    let navigationMenuUl = document.getElementById("navigationMenuUl");
    navigationMenuUl.innerHTML = navigationFooterItems.map(navigationFooterItem => `<li><a href="${navigationFooterItem.url}"><i class="${navigationFooterItem.icon}"></i>&nbsp;${navigationFooterItem.text}</a></li>`).join(" ")
}

// Funkcija koja generiše HTML kod za prikazivanje liste proizvoda u prodavnici
function populateShop(shopItems) {
    products = shopItems;

    let shopItemsDiv = document.getElementById("shopItemsDiv")
    let category = document.getElementById("category-filter").value
    let rating = document.getElementById("rating-filter").value
    let sortBy = document.getElementById("sort-by").value
    shopItemsDiv.innerHTML = shopItems
        .filter(shopItem => (category == shopItem.category || category == "All Categories") && (rating == 0 || rating <= shopItem.rating))
        .sort((a, b) => sortBy == "priceAsc" ? (a.price - b.price) :
            sortBy == "priceDesc" ? (b.price - a.price) :
                sortBy == "nameAsc" ? a.title.localeCompare(b.title) :
                    sortBy == "nameDesc" ? b.title.localeCompare(a.title) :
                        0)
        .map(shopItem => `<div class="col mb-5">
    <div class="card h-100">
        ${shopItem.badge ? `<div class="badge bg-dark text-white position-absolute">${shopItem.badge}</div>` : " "}
        <img class="card-img-top" src="${shopItem.image}" alt="Product2" />
        <div class="card-body p-4">
            <div class="text-center">
                <h5 class="fw-bolder">${shopItem.title}</h5>
                <div class="d-flex justify-content-center small text-warning mb-2">
                ${`<div class="bi-star-fill"></div>`.repeat(shopItem.rating)
            }
                    
                </div>
                <span class="text-muted text-decoration-line-through">${shopItem.oldPrice ? "$" + shopItem.oldPrice : " "}</span>
                ${"$"}${shopItem.price}
            </div>
        </div>
        <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
            <div class="text-center">
            <a class="btn btn-outline-dark mt-auto" onclick="addToCart(${shopItem.id})">Add
                    to cart</a>
            </div>
        </div>
    </div>
</div>` ).join(" ");
}

// Funkcija koja dodaje proizvod u korpu
function addToCart(idProizvoda) {
    let product = products.find(x => x.id == idProizvoda);

    if (product) {
        $('#productAddedToCartName').text(product.title);
        $('#addedToCartModal').modal('show');

    }

    let cart = JSON.parse(localStorage.getItem("cart"));

    if (!cart) {
        cart = [idProizvoda];
    } else {
        cart.push(idProizvoda);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    refreshProductNumber()
}

// Funkcija koja ažurira broj proizvoda prikazanih u korpi
function refreshProductNumber() {
    let cart = JSON.parse(localStorage.getItem("cart"));
    let productsNumber = cart ? cart.length : 0;
    document.getElementById("productsNumberSpan").innerHTML = productsNumber;
}

// Funkcija koja generiše HTML kod za prikazivanje proizvoda u korpi
function populateCart(shopItems) {
    let shopItemsDiv = document.getElementById("shopItemsDiv");
    let cart = JSON.parse(localStorage.getItem("cart"));
    cart = cart ? cart : []
    let filteredShopItems = shopItems.filter(shopItem => cart.includes(shopItem.id));
    let totalPrice = 0
    filteredShopItems.forEach(shopItem => {
        totalPrice = totalPrice + parseFloat(shopItem.price) * cart.filter(cartItem => cartItem == shopItem.id).length
    });
    document.getElementById("totalSpan").innerHTML = totalPrice
    shopItemsDiv.innerHTML = filteredShopItems.map(shopItem => `<div class="col mb-5">
    <div class="card h-100">
        ${shopItem.badge ? `<div class="badge bg-dark text-white position-absolute">${shopItem.badge}</div>` : " "}
        <img class="card-img-top" src="${shopItem.image}" alt="Product2" />
        <div class="card-body p-4">
            <div class="text-center">
                <h5 class="fw-bolder">${shopItem.title}</h5>
                <div class="d-flex justify-content-center small text-warning mb-2">
                ${`<div class="bi-star-fill"></div>`.repeat(shopItem.rating)
        }
                    
                </div>
                <span class="text-muted text-decoration-line-through">${shopItem.oldPrice ? "$" + shopItem.oldPrice : " "}</span>
                ${"$"}${shopItem.price}
            </div>
        </div>
        <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
            <div class="text-center">
                ${cart.filter(cartItem => cartItem == shopItem.id).length}X
            </div>
        </div>
    </div>
</div>` ).join(" ");
}

// Funkcija koja uklanja sve proizvode iz korpe
function removeCart() {
    localStorage.removeItem("cart");
    fetchData("products", populateCart);
}

// Funkcija koja validira informacije unete u formi za naručivanje i prikazuje odgovarajući modal
function orderNow() {
    const validationRules = [
        {
            input: document.getElementById("name").value,
            regex: /^[A-Za-zŠĐĆČŽšđćčž]+(?: [A-Za-zŠĐĆČŽšđćčž]+)*$/,
            errorMessage: "The name is mandatory and must have the first initial capital letter.",
        },
        {
            input: document.getElementById("last-name").value,
            regex: /^[A-Za-zŠĐĆČŽšđćčž]+(?: [A-Za-zŠĐĆČŽšđćčž]+)*$/,
            errorMessage: "The last name is mandatory and must have the first initial capital letter."
        },
        {
            input: document.getElementById("email").value,
            regex: /^[a-zA-Z0-9._%+-]+@(gmail|yahoo|hotmail)\.com$/,
            errorMessage: "Email address is required and must be in the correct format."
        },
        {
            input: document.getElementById("phone").value,
            regex: /^\+?[0-9]\d{1,14}$/,
            errorMessage: "Phone number is mandatory!"
        },
        {
            input: document.getElementById("address").value,
            regex: /^[A-Za-zŠĐĆČŽšđćčž0-9\s,.-]{5,100}$/,
            errorMessage: "Address is mandatory!"
        },
        {
            input: document.getElementById("credit-card-number").value,
            regex: /^\d{4}(\s|-)?\d{4}(\s|-)?\d{4}(\s|-)?\d{4}/,
            errorMessage: "Credit card number is mandatory!"
        }
    ];

    var errorMessages = [];

    for (var rule of validationRules) {
        if (!validateField(rule.input, rule.regex)) {
            errorMessages.push(rule.errorMessage);
        }
    }

    if (!document.getElementById("agree-to-rules").checked) {
        errorMessages.push("You must agree to the terms and conditions!");
    }

    if (!document.querySelector('input[name="payment-method"]:checked')) {
        errorMessages.push("Select a payment method!");
    }

    if (errorMessages.length > 0) {
        writeErrors(errorMessages);
    } else {
        writeSuccess();
    }
}

// Funkcija koja vrši validaciju unetih podataka u formi koristeći regularni izraz
function validateField(fieldValue, regex) {
    return regex.test(fieldValue);
}

//Funkcija koja Generiše poruke o greškama i prikazuje ih korisniku
function writeErrors(greske) {
    populateModal("none", "Invalid information", greske.map(greska => `<p class="text-danger">${greska}</p>`).join(""));
}

// Funkcija koja generiše potvrdu o uspešnoj narudžbini i prikazuje je korisniku
function writeSuccess() {
    let modalBody = "<h3>Are you sure you want to place the order?</h3>"
    modalBody += `<p>Name: ${document.getElementById("name").value}</p>`
    modalBody += `<p>Credit Card Type: ${document.querySelector('input[name="payment-method"]:checked').value}</p>`
    populateModal("block", "Order Confirmation", modalBody);
}

// Funkcija koja popunjava modalni prozor sa određenim naslovom, sadržajem i opcijom za naručivanje
function populateModal(orderButtonDisplay, modalTitle, modalBody) {
    let modalBodyDiv = document.getElementById("modalBodyDiv");
    let modalTitleH1 = document.getElementById("modalTitleH1");
    let placeOrderButton = document.getElementById("placeOrderButton");
    placeOrderButton.style.display = orderButtonDisplay;
    modalTitleH1.innerHTML = modalTitle;
    modalBodyDiv.innerHTML = modalBody;
}

// Funkcija koja obavlja procesiranje narudžbine, čisti korpu i preusmerava korisnika na početnu stranicu, sa dodatnim prikazom potvrde o uspešnoj narudžbini
function order() {
    localStorage.removeItem("cart");
    localStorage.setItem('showSuccessfullOrderModal', 'true');
    window.location.href = "/project3/index.html";
}
