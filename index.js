// #region ----------------- 題目 ------------------ 
// 首頁
// 篩選
// OK 產品渲染
// OK 加入購物車（點一次數量加一）
// OK 刪除購物車特定產品
// OK 清空購物車
// OK 送出訂單 只驗證欄位不為空
// OK 產品價格千分位
// #endregion ----------------- 題目 ------------------

// #region ----------------- 變數宣告 ------------------
const baseUrl = 'https://livejs-api.hexschool.io/api/livejs/v1';
const api_path = 'potato';
let theProducts = []; //產品資料
let theCart = []; //購物車資料

// #endregion ----------------- 變數宣告 ------------------

// #region ----------------- 邏輯流程 ------------------
// wait for DOM ready
document.addEventListener('DOMContentLoaded', function () {
    init();
    document.querySelector('#productDisplay select.productSelect').addEventListener('change', function (e) {
        filterProducts(e.target.value);
    });
    document.querySelector('#orderInfo form input[type="submit"]').addEventListener('click', function (e) {
        e.preventDefault();
        validateForm();
    });
});

// init
function init() {
    document.querySelectorAll(`#orderInfo form p.orderInfo-message`).forEach(x => x.textContent = ""); //清除訂單錯誤訊息
    getProduct();
    getCart();
}

//篩選產品
function filterProducts(category) {
    if (category == '全部') {
        document.querySelectorAll('#productDisplay ul.productWrap li').forEach(item => { item.setAttribute('style', 'display: block') });
    } else {
        document.querySelectorAll('#productDisplay ul.productWrap li').forEach(item => { item.setAttribute('style', 'display: none') });
        document.querySelectorAll(`#productDisplay ul.productWrap li.${category}`).forEach(item => { item.setAttribute('style', 'display: block') });
    }
}

//加入購物車
function addToCart(id) {
    theCart.findIndex(item => item.product.id == id) == -1 ? addCart(id) : updateCart(id);
}

//刪除購物車特定產品
function btnDeleteCart(id) {
    deleteCart(id);
}

//驗證表單
function validateForm() {
    let name = document.querySelector("#customerName");
    let tel = document.querySelector("#customerPhone");
    let email = document.querySelector("#customerEmail");
    let address = document.querySelector("#customerAddress");
    let payment = document.querySelector("#tradeWay");
    let isValidate = true;
    [name, tel, email, address].forEach(item => {
        const theName = item.getAttribute('name');
        let msgElement = document.querySelector(`#orderInfo form p[data-message='${theName}']`);
        if (item.value == "") {
            msgElement.textContent = "必填";
            isValidate = false;
        } else {
            msgElement.textContent = "";
        }

    })
    if (!isValidate) return; //驗證失敗就結束
    let model = {
        "data": {
            "user": {
                "name": name.value,
                "tel": tel.value,
                "email": email.value,
                "address": address.value,
                "payment": payment.value
            }
        }
    }
    sendOrder(model);
}

// #endregion ----------------- 邏輯流程 ------------------


// #region ----------------- API ------------------

//取得產品資料
function getProduct() {
    axios.get(`${baseUrl}/customer/${api_path}/products`)
        .then(function (response) {
            theProducts = response.data.products;
            renderProductSelect(theProducts); //渲染productSelect
            renderProduct(theProducts); //渲染產品
        })
        .catch(function (error) {
            console.log(error);
        })
}

//取得購物車資料
function getCart() {
    axios.get(`${baseUrl}/customer/${api_path}/carts`)
        .then(function (response) {
            theCart = response.data.carts;
            renderCart()
        })
        .catch(function (error) {
            console.log(error);
        })
}

//加入購物車
function addCart(id) {
    axios.post(`${baseUrl}/customer/${api_path}/carts`, {
        "data": {
            "productId": id,
            "quantity": 1
        }
    })
        .then(function (response) {
            getCart();
        })
        .catch(function (error) {
            console.log(error);
        })
}

//更新購物車
function updateCart(id) {
    let index = theCart.findIndex(item => item.product.id == id);
    let quantity = theCart[index].quantity + 1;
    axios.patch(`${baseUrl}/customer/${api_path}/carts`, {
        "data": {
            "id": theCart[index].id,
            "quantity": quantity
        }
    })
        .then(function (response) {
            getCart();
        })
        .catch(function (error) {
            console.log(error);
        })
}

//刪除購物車特定產品
function deleteCart(id) {
    axios.delete(`${baseUrl}/customer/${api_path}/carts/${id}`)
        .then(function (response) {
            getCart();
        })
        .catch(function (error) {
            console.log(error);
        })
}
//清空購物車
function deleteHoldCart() {
    axios.delete(`${baseUrl}/customer/${api_path}/carts`)
        .then(function (response) {
            getCart();
        })
        .catch(function (error) {
            console.log(error);
        })
}
//送出訂單
function sendOrder(model) {
    axios.post(`${baseUrl}/customer/${api_path}/orders`, model)
        .then(function (response) {
            alert("訂單送出成功");
            getCart();
        })
        .catch(function (error) {
            console.log(error);
        })
}

// #endregion ----------------- API ------------------

// #region ----------------- 畫面處理 ------------------

// 渲染產品
function renderProduct(products = theProducts) {
    const productList = document.querySelector('#productDisplay ul.productWrap');
    let contents = []
    products.forEach(item => {
        let { id, category, description, images, origin_price, price, title } = item;
        let content = ` <li class="productCard ${category}">
                            <h4 class="productType">新品</h4>
                            <img src="${images}" alt="" />
                            <a class="addCardBtn" onclick="addToCart('${id}')">加入購物車</a>
                            <h3>${title}</h3>
                            <del class="originPrice">NT$${origin_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</del>
                            <p class="nowPrice">NT$${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
                        </li>`;
        contents.push(content);
    })
    productList.innerHTML = contents.join('');
}
// 渲染產品下拉選單 productSelect
function renderProductSelect(products = theProducts) {
    const productSelect = document.querySelector('#productDisplay select.productSelect');
    let cats = {};
    let contents = [`<option value="全部" selected>全部</option>`];
    products.forEach(item => {
        cats[item.category] = item.category;
    })
    Object.keys(cats).forEach(item => {
        let content = `<option value="${item}">${item}</option>`;
        contents.push(content);
    })
    productSelect.innerHTML = contents.join('');
}
// 渲染購物車
function renderCart() {
    let contents = []
    let totalPrice = 0;
    theCart.forEach(item => {
        let { id, product, quantity } = item;
        let { images, title, price } = product;
        totalPrice += price * quantity;
        let content = ` <tr>
                            <td>
                                <div class="cardItem-title">
                                    <img src="${images}" alt="">
                                    <p>${title}</p>
                                </div>
                            </td>
                            <td>NT$${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td>${quantity}</td>
                            <td>NT$${(price * quantity).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            <td class="discardBtn">
                                <a onclick="btnDeleteCart('${id}')" class="finger">X</a>
                            </td>
                        </tr>`;
        contents.push(content);
    })
    let endContent = `
                    <tr>
                        <td>
                            <a class="discardAllBtn" onclick="deleteHoldCart()">刪除所有品項</a>
                        </td>
                        <td></td>
                        <td></td>
                        <td>
                            <p>總金額</p>
                        </td>
                        <td>NT$${totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                    </tr>
                    `
    contents.push(endContent);
    document.querySelector('#shoppingCart table tbody').innerHTML = contents.join('');
}

// #endregion ----------------- 畫面處理 ------------------