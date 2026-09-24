const managerWhatsApp = "963981853998";
let currentRating = 0;
let shoppingCart = JSON.parse(localStorage.getItem('myShoppingCart')) || [];

document.addEventListener("DOMContentLoaded", () => {
    fixAndNormalizeOrdersData();
    checkUserState();
    checkManagerSession();
    initTheme();
    updateCartUI();
});

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const sidebarThemeBtn = document.getElementById('sidebar-theme-btn');
    
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme, sidebarThemeBtn);
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            updateThemeIcon('dark', sidebarThemeBtn);
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            updateThemeIcon('light', sidebarThemeBtn);
        }
    }
}

function updateThemeIcon(theme, btn) {
    if (!btn) return;
    if (theme === 'dark') {
        btn.innerHTML = '<i class="fa-solid fa-sun"></i> تبديل الثيم (ليلي/نهاري)';
    } else {
        btn.innerHTML = '<i class="fa-solid fa-moon"></i> تبديل الثيم (ليلي/نهاري)';
    }
}

const sidebarThemeBtn = document.getElementById('sidebar-theme-btn');
if (sidebarThemeBtn) {
    sidebarThemeBtn.addEventListener('click', () => {
        const htmlElement = document.documentElement;
        if (htmlElement.getAttribute('data-theme') === 'dark') {
            htmlElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            updateThemeIcon('light', sidebarThemeBtn);
        } else {
            htmlElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            updateThemeIcon('dark', sidebarThemeBtn);
        }
    });
}

function goToSection(sectionId) {
    switchViewHomeOnly();
    setTimeout(() => {
        const targetElement = document.getElementById(sectionId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    }, 100);
}

function switchViewHomeOnly() {
    document.querySelectorAll('.main-view').forEach(view => {
        view.classList.remove('active');
    });
    const target = document.getElementById('home-view');
    if (target) {
        target.classList.add('active');
        window.scrollTo(0, 0);
    }
}

function fixAndNormalizeOrdersData() {
    let orders = JSON.parse(localStorage.getItem('adminAllOrders')) || JSON.parse(localStorage.getItem('userOrders')) || [];
    let updated = false;
    
    const savedName = localStorage.getItem('userName') || "زبون محلي";
    const savedPhone = localStorage.getItem('userPhone') || "+963900000000";

    orders = orders.map(o => {
        if (!o.customerName || o.customerName === "undefined") {
            o.customerName = savedName;
            updated = true;
        }
        if (!o.customerPhone || o.customerPhone === "undefined") {
            o.customerPhone = savedPhone;
            updated = true;
        }
        if (!o.phone) {
            o.phone = savedPhone;
            updated = true;
        }
        if (!o.invoiceId) {
            o.invoiceId = Math.floor(1000 + Math.random() * 9000);
            updated = true;
        }
        if (!o.orderId) {
            o.orderId = Math.floor(1000 + Math.random() * 9000);
            updated = true;
        }
        if (!o.dateTime || o.dateTime.includes("undefined") || o.dateTime.includes("٢") || o.dateTime.includes("١")) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            o.dateTime = `${year}/${month}/${day} - 12:00 PM`;
            updated = true;
        }
        if (!o.priceSyp) {
            o.priceSyp = "85,000 ل.س";
            o.priceUsd = "/ 6$";
            updated = true;
        }
        return o;
    });

    if (updated) {
        localStorage.setItem('adminAllOrders', JSON.stringify(orders));
        localStorage.setItem('userOrders', JSON.stringify(orders));
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
}

function switchView(viewId) {
    if (viewId !== 'cart-view') {
        toggleSidebar();
    }
    document.querySelectorAll('.main-view').forEach(view => {
        view.classList.remove('active');
    });
    const target = document.getElementById(viewId);
    if (target) {
        target.classList.add('active');
        window.scrollTo(0, 0);
    }
}

// دوال سلة المشتريات
function addToCart(productName, priceSyp, priceUsd) {
    shoppingCart.push({
        product: productName,
        priceSyp: priceSyp,
        priceUsd: priceUsd
    });
    localStorage.setItem('myShoppingCart', JSON.stringify(shoppingCart));
    updateCartUI();
    alert(`تمت إضافة "${productName}" إلى السلة بنجاح! 🛒`);
}

function removeFromCart(index) {
    shoppingCart.splice(index, 1);
    localStorage.setItem('myShoppingCart', JSON.stringify(shoppingCart));
    updateCartUI();
}

function updateCartUI() {
    const cartCounter = document.getElementById('cart-counter');
    if (cartCounter) cartCounter.innerText = shoppingCart.length;

    const cartList = document.getElementById('cart-items-list');
    const totalSypDisplay = document.getElementById('cart-total-syp');
    const totalUsdDisplay = document.getElementById('cart-total-usd');
    if (!cartList) return;

    cartList.innerHTML = '';
    let totalSyp = 0;
    let totalUsd = 0;

    if (shoppingCart.length === 0) {
        cartList.innerHTML = '<li style="text-align: center; opacity: 0.7; padding: 20px; display: block;">السلة فارغة حالياً.</li>';
        if (totalSypDisplay) totalSypDisplay.innerText = '0 ل.س';
        if (totalUsdDisplay) totalUsdDisplay.innerText = '($0.00)';
        return;
    }

    shoppingCart.forEach((item, index) => {
        const sypMatch = String(item.priceSyp).replace(/,/g, '').match(/\d+/);
        const usdMatch = String(item.priceUsd).match(/[\d.]+/);
        if (sypMatch) totalSyp += parseInt(sypMatch[0]);
        if (usdMatch) totalUsd += parseFloat(usdMatch[0]);

        const li = document.createElement('li');
        li.innerHTML = `
            <div class="cart-item-info">
                <strong>${item.product}</strong>
                <span style="font-size: 0.85rem; opacity: 0.8;">${item.priceSyp} (${item.priceUsd})</span>
            </div>
            <button class="btn-remove-item" onclick="removeFromCart(${index})">حذف</button>
        `;
        cartList.appendChild(li);
    });

    if (totalSypDisplay) totalSypDisplay.innerText = `${totalSyp.toLocaleString()} ل.س`;
    if (totalUsdDisplay) totalUsdDisplay.innerText = `($${totalUsd.toFixed(2)})`;
}

function checkoutCart() {
    if (shoppingCart.length === 0) {
        alert('⚠️ السلة فارغة! الرجاء اختيار بعض الأصناف أولاً.');
        return;
    }

    const savedName = localStorage.getItem('userName') || "زبون زائر";
    const savedPhone = localStorage.getItem('userPhone') || "+963988888888";

    const invoiceId = getNextInvoiceNumber();
    const orderId = Math.floor(1000 + Math.random() * 9000);

    const now = new Date();
    const dateTimeString = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} - ${String(now.getHours() % 12 || 12).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;

    let totalSypSum = 0;
    let totalUsdSum = 0;
    let productsText = "";

    shoppingCart.forEach((item, idx) => {
        productsText += `\n${idx + 1}. ${item.product} - ${item.priceSyp} (${item.priceUsd})`;
        const sypMatch = String(item.priceSyp).replace(/,/g, '').match(/\d+/);
        const usdMatch = String(item.priceUsd).match(/[\d.]+/);
        if (sypMatch) totalSypSum += parseInt(sypMatch[0]);
        if (usdMatch) totalUsdSum += parseFloat(usdMatch[0]);
    });

    const finalPriceSyp = `${totalSypSum.toLocaleString()} ل.س`;
    const finalPriceUsd = `/ $${totalUsdSum.toFixed(2)}`;

    const newOrder = { 
        invoiceId: invoiceId,
        orderId: orderId,
        customerName: savedName,
        customerPhone: savedPhone,
        phone: savedPhone,
        product: `[سلة مشتريات تضم ${shoppingCart.length} أصناف]: ${productsText}`, 
        priceSyp: finalPriceSyp, 
        priceUsd: finalPriceUsd, 
        dateTime: dateTimeString 
    };

    const adminOrders = JSON.parse(localStorage.getItem('adminAllOrders')) || [];
    const userOrders = JSON.parse(localStorage.getItem('userOrders')) || [];
    
    adminOrders.push(newOrder);
    userOrders.push(newOrder);
    
    localStorage.setItem('adminAllOrders', JSON.stringify(adminOrders));
    localStorage.setItem('userOrders', JSON.stringify(userOrders));

    shoppingCart = [];
    localStorage.removeItem('myShoppingCart');
    updateCartUI();
    checkUserState();

    const messageText = `مرحباً، أرغب بطلب فاتورة سلة المشتريات التالية (#${invoiceId}):\n${productsText}\n\n*الإجمالي الكلي:* ${finalPriceSyp} (${finalPriceUsd})\n\nمعلومات الزبون:\n- الاسم: ${savedName}\n- الهاتف: ${savedPhone}`;
    
    const encodedMessage = encodeURIComponent(messageText);
    const whatsappUrl = `https://wa.me/${managerWhatsApp}?text=${encodedMessage}`;
    
    window.location.href = whatsappUrl;
}

function setRating(stars) {
    currentRating = stars;
    updateStarsDisplay(stars);
    document.getElementById('rating-text').innerText = `تقييمك: ${stars} من 5 نجوم ⭐`;
}
function hoverRating(stars) { updateStarsDisplay(stars); }
function resetHover() { updateStarsDisplay(currentRating); }
function updateStarsDisplay(count) {
    const starsList = document.querySelectorAll('#star-rating-container i');
    starsList.forEach((star, index) => {
        star.style.color = index < count ? '#f39c12' : '#ccc';
    });
}
function submitRating() {
    const comment = document.getElementById('rating-comment').value.trim();
    if (currentRating === 0) { alert('الرجاء اختيار عدد النجوم أولاً!'); return; }
    const savedName = localStorage.getItem('userName') || "زبون مجهول";
    const ratings = JSON.parse(localStorage.getItem('userRatings')) || [];
    const now = new Date();
    const dateTimeString = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
    
    ratings.push({ name: savedName, stars: currentRating, comment: comment || "بدون تعليق", date: dateTimeString });
    localStorage.setItem('userRatings', JSON.stringify(ratings));

    alert(`شكراً لك! تم إرسال تقييمك (${currentRating} نجوم) بنجاح 🌟`);
    document.getElementById('rating-comment').value = '';
    setRating(0);
    switchView('home-view');
}

function checkManagerAccess() {
    toggleSidebar();
    switchView('manager-view');
    checkManagerSession();
}

function loginManager() {
    const fullname = document.getElementById('mgr-fullname').value.trim();
    const nationalId = document.getElementById('mgr-nationalid').value.trim();
    const email = document.getElementById('mgr-email').value.trim();
    const emailPass = document.getElementById('mgr-email-pass').value.trim();
    const appPass = document.getElementById('mgr-app-pass').value.trim();

    const secretMasterPassword = "Aman_Admin_2026"; 

    if (!fullname || !nationalId || !email || !emailPass || !appPass) {
        alert('⚠️ الرجاء تعبئة كافة حقول تسجيل الدخول الإداري!');
        return;
    }

    if (appPass !== secretMasterPassword) {
        alert('❌ كلمة سر التطبيق السرية غير صحيحة! الدخول مقتصر على مهندسة أمان فقط.');
        return;
    }

    localStorage.setItem('managerLoggedIn', 'true');
    localStorage.setItem('managerName', fullname);
    checkManagerSession();
    alert('✅ أهلاً بكِ يا مهندسة أمان في لوحة التحكم الإدارية!');
}

function checkManagerSession() {
    const isLogged = localStorage.getItem('managerLoggedIn');
    const mgrName = localStorage.getItem('managerName');
    const loginBox = document.getElementById('manager-login-box');
    const dashboardBox = document.getElementById('manager-dashboard-box');

    if (isLogged === 'true') {
        if (loginBox) loginBox.style.display = 'none';
        if (dashboardBox) dashboardBox.style.display = 'block';
        document.getElementById('mgr-display-name').innerText = mgrName || "مدير المحل";
        loadManagerDashboard();
    } else {
        if (loginBox) loginBox.style.display = 'block';
        if (dashboardBox) dashboardBox.style.display = 'none';
    }
}

function logoutManager() {
    localStorage.removeItem('managerLoggedIn');
    localStorage.removeItem('managerName');
    checkManagerSession();
    alert('تم تسجيل خروج الأدمن بنجاح.');
    switchView('home-view');
}

function saveUser() {
    const nameInput = document.getElementById('user-name');
    const phoneInput = document.getElementById('user-phone');
    if (!nameInput || !phoneInput) return;

    const name = nameInput.value.trim();
    let phone = phoneInput.value.trim();
    if (name === '' || phone === '') { alert('الرجاء إدخال الاسم ورقم الهاتف!'); return; }

    phone = phone.replace(/\s+/g, '');
    const syrianPhoneRegex = /^(?:\+963|00963|9|0)?(9\d{8})$/;
    if (!syrianPhoneRegex.test(phone)) {
        alert('⚠️ رقم الهاتف غير صحيح! أدخل رقم سوري نظامي (مثال: 0912345678)');
        return;
    }

    let formattedPhone = phone.startsWith('09') ? '+963' + phone.substring(1) : '+963' + phone;
    localStorage.setItem('userName', name);
    localStorage.setItem('userPhone', formattedPhone);
    if (!localStorage.getItem('userOrders')) localStorage.setItem('userOrders', JSON.stringify([]));

    checkUserState();
    alert('✅ تم حفظ الحساب بنجاح!');
}

function updateUserProfile() {
    const newName = document.getElementById('edit-user-name').value.trim();
    let newPhone = document.getElementById('edit-user-phone').value.trim();

    if (!newName || !newPhone) { alert('الرجاء عدم إبقاء الحقول فارغة عند التعديل!'); return; }

    newPhone = newPhone.replace(/\s+/g, '');
    const syrianPhoneRegex = /^(?:\+963|00963|9|0)?(9\d{8})$/;
    if (!syrianPhoneRegex.test(newPhone)) { alert('⚠️ رقم الهاتف الجديد غير صحيح!'); return; }

    let formattedPhone = newPhone.startsWith('09') ? '+963' + newPhone.substring(1) : '+963' + newPhone;
    localStorage.setItem('userName', newName);
    localStorage.setItem('userPhone', formattedPhone);

    checkUserState();
    alert('✅ تم تحديث بيانات الحساب بنجاح!');
}

function checkUserState() {
    const savedName = localStorage.getItem('userName');
    const savedPhone = localStorage.getItem('userPhone');
    
    const loginBox = document.getElementById('account-login-box');
    const infoBox = document.getElementById('account-info-box');

    if (savedName && savedPhone) {
        if (loginBox) loginBox.style.display = 'none';
        if (infoBox) infoBox.style.display = 'block';
        
        document.getElementById('edit-user-name').value = savedName;
        document.getElementById('edit-user-phone').value = savedPhone;

        let primaryOrders = JSON.parse(localStorage.getItem('adminAllOrders')) || [];
        let secondaryOrders = JSON.parse(localStorage.getItem('userOrders')) || [];
        let combinedMap = new Map();
        [...primaryOrders, ...secondaryOrders].forEach(o => {
            if (o && (o.invoiceId || o.orderId)) {
                combinedMap.set(o.invoiceId || o.orderId, o);
            }
        });
        const orders = Array.from(combinedMap.values());
        
        const fullOrdersList = document.getElementById('full-orders-list');
        const userOrders = orders.filter(o => o.phone === savedPhone || o.customerPhone === savedPhone);

        let totalSyp = 0;
        let totalUsd = 0;

        if (fullOrdersList) {
            fullOrdersList.innerHTML = '';
            if (userOrders.length === 0) {
                fullOrdersList.innerHTML = '<li style="text-align:center; opacity:0.7; padding: 10px;">لا توجد مشتريات مسجلة بعد.</li>';
            } else {
                userOrders.forEach(o => {
                    const li = document.createElement('li');
                    li.style.cssText = "margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px dashed var(--border-color); font-size: 0.95rem; text-align: right;";
                    
                    const priceSypStr = o.priceSyp ? String(o.priceSyp) : "0";
                    const priceUsdStr = o.priceUsd ? String(o.priceUsd) : "0";
                    const sypMatch = priceSypStr.replace(/,/g, '').match(/\d+/);
                    const usdMatch = priceUsdStr.match(/[\d.]+/);
                    
                    if (sypMatch) totalSyp += parseInt(sypMatch[0]);
                    if (usdMatch) totalUsd += parseFloat(usdMatch[0]);

                    li.innerHTML = `<strong>الطلب:</strong> ${o.product}<br>
                                    <strong>السعر:</strong> ${priceSypStr} (${priceUsdStr})<br>
                                    <strong>رقم الطلبية:</strong> #${o.orderId || '---'}<br>
                                    <span style="font-size: 0.8rem; opacity: 0.7;">⏰ التاريخ: ${o.dateTime || '---'}</span>`;
                    fullOrdersList.appendChild(li);
                });
            }
        }

        const totalPaymentsDisplay = document.getElementById('total-payments-display');
        const totalPaymentsUsd = document.getElementById('total-payments-usd');
        if (totalPaymentsDisplay) totalPaymentsDisplay.innerText = `${totalSyp.toLocaleString()} ل.س`;
        if (totalPaymentsUsd) totalPaymentsUsd.innerText = `$${totalUsd.toFixed(2)}`;

    } else {
        if (loginBox) loginBox.style.display = 'block';
        if (infoBox) infoBox.style.display = 'none';
    }
}

function logout() {
    localStorage.removeItem('userName');
    localStorage.removeItem('userPhone');
    checkUserState();
    alert('تم تسجيل الخروج بنجاح.');
    switchView('home-view');
}

function loadManagerDashboard(filteredOrders = null) {
    let primaryOrders = JSON.parse(localStorage.getItem('adminAllOrders')) || [];
    let secondaryOrders = JSON.parse(localStorage.getItem('userOrders')) || [];
    
    let combinedMap = new Map();
    [...primaryOrders, ...secondaryOrders].forEach(o => {
        if (o && (o.invoiceId || o.orderId)) {
            let key = o.invoiceId || o.orderId;
            combinedMap.set(key, o);
        }
    });

    let orders = filteredOrders || Array.from(combinedMap.values());
    
    const sortSelect = document.getElementById('admin-sort-order');
    const sortValue = sortSelect ? sortSelect.value : 'newest';

    orders.sort((a, b) => {
        let dateA = new Date((a.dateTime || "").replace(' - ', ' '));
        let dateB = new Date((b.dateTime || "").replace(' - ', ' '));
        
        if (isNaN(dateA)) dateA = 0;
        if (isNaN(dateB)) dateB = 0;

        if (sortValue === 'oldest') {
            return dateA - dateB;
        } else {
            return dateB - dateA;
        }
    });

    const mgrFullList = document.getElementById('manager-full-orders');
    if (!mgrFullList) return;

    mgrFullList.innerHTML = '';
    let dailySyp = 0, weeklySyp = 0, monthlySyp = 0;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentDay = String(now.getDate()).padStart(2, '0');
    const todayString = `${currentYear}/${currentMonth}/${currentDay}`;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    if (orders.length === 0) {
        mgrFullList.innerHTML = '<li style="text-align:center; opacity:0.7; padding: 15px;">لا توجد طلبيات مسجلة حتى الآن.</li>';
    } else {
        orders.forEach(o => {
            const li = document.createElement('li');
            li.style.cssText = "margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid var(--border-color); font-size: 0.9rem;";
            
            li.innerHTML = `<span style="background:var(--accent-color); color:#fff; padding:3px 8px; border-radius:4px; font-size:0.8rem; font-weight:bold;">فاتورة #${o.invoiceId || '---'} | طلب #${o.orderId || '---'}</span><br>
                            <strong>الزبون:</strong> ${o.customerName || 'زبون'} (${o.customerPhone || 'بدون رقم'})<br>
                            <strong>الصنف:</strong> ${o.product || '---'} - <strong>السعر:</strong> ${o.priceSyp || '0'} (${o.priceUsd || '0'})<br>
                            <span style="opacity:0.7;">📅 التاريخ: ${o.dateTime || '---'}</span>`;
            mgrFullList.appendChild(li);

            const sypMatch = o.priceSyp ? String(o.priceSyp).replace(/,/g, '').match(/\d+/) : null;
            const sypVal = sypMatch ? parseInt(sypMatch[0]) : 0;

            if (o.dateTime) {
                if (o.dateTime.includes(todayString)) {
                    dailySyp += sypVal;
                }

                const datePart = o.dateTime.split(' - ')[0];
                const orderDate = new Date(datePart);

                if (!isNaN(orderDate)) {
                    if (orderDate >= sevenDaysAgo && orderDate <= now) {
                        weeklySyp += sypVal;
                    }
                    if (datePart.startsWith(`${currentYear}/${currentMonth}`)) {
                        monthlySyp += sypVal;
                    }
                }
            }
        });
    }

    const ratings = JSON.parse(localStorage.getItem('userRatings')) || [];
    if (ratings.length > 0) {
        mgrFullList.innerHTML += `<hr style="margin: 20px 0; border-color: var(--border-color);"><h4 style="color: var(--accent-color); margin-bottom: 10px;">⭐ تقييمات وآراء العملاء (${ratings.length}):</h4>`;
        ratings.forEach(r => {
            mgrFullList.innerHTML += `<li style="margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px dashed var(--border-color); font-size: 0.9rem;">
                <strong>${r.name}</strong> - تقييم: ${r.stars}/5 ⭐<br>
                <em>"${r.comment}"</em><br><span style="opacity: 0.7; font-size: 0.8rem;">${r.date}</span>
            </li>`;
        });
    }

    document.getElementById('mgr-daily').innerText = `${dailySyp.toLocaleString()} ل.س`;
    document.getElementById('mgr-weekly').innerText = `${weeklySyp.toLocaleString()} ل.س`;
    document.getElementById('mgr-monthly').innerText = `${monthlySyp.toLocaleString()} ل.س`;
}

function filterManagerOrders() {
    const dateInput = document.getElementById('admin-filter-date').value;
    if (!dateInput) { alert('الرجاء اختيار تاريخ أولاً!'); return; }

    let primaryOrders = JSON.parse(localStorage.getItem('adminAllOrders')) || [];
    let secondaryOrders = JSON.parse(localStorage.getItem('userOrders')) || [];
    let combinedMap = new Map();
    [...primaryOrders, ...secondaryOrders].forEach(o => {
        if (o && (o.invoiceId || o.orderId)) {
            combinedMap.set(o.invoiceId || o.orderId, o);
        }
    });

    const orders = Array.from(combinedMap.values());
    const formattedInput = dateInput.replace(/-/g, '/');
    const filtered = orders.filter(o => o.dateTime && o.dateTime.includes(formattedInput));
    loadManagerDashboard(filtered);
}

function resetManagerFilter() {
    document.getElementById('admin-filter-date').value = '';
    loadManagerDashboard();
}

function getNextInvoiceNumber() {
    let lastInvoice = parseInt(localStorage.getItem('lastInvoiceId')) || 1000;
    let nextInvoice = lastInvoice + 1;
    localStorage.setItem('lastInvoiceId', nextInvoice);
    return nextInvoice;
}