document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================
    // 1. كود تغيير صورة واسم لون المنتج
    // ==========================================
    const colorSwatches = document.querySelectorAll('.product-colors img');
    const mainImage = document.getElementById('main-pillow-img');
    const colorNameDisplay = document.getElementById('selected-color-name');

    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', function() {
            const newImageSrc = this.getAttribute('data-src');
            const newColorName = this.getAttribute('data-name');
            
            mainImage.src = newImageSrc;
            colorNameDisplay.textContent = newColorName;
            
            mainImage.style.opacity = '0.5';
            setTimeout(() => {
                mainImage.style.opacity = '1';
            }, 200);
        });
    });

    // ==========================================
    // 2. كود السلة الذكية (إضافة المنتجات)
    // ==========================================
    window.cartItems = []; 

    window.addToCart = function() {
        const product = document.getElementById('productSelect').value;
        const color = document.getElementById('productColor').value;
        const size = document.getElementById('productSize').value;
        const qty = document.getElementById('productQty').value;

        // التحقق من أن اللون والمقاس مكتوبين
        if (!color.trim() || !size.trim()) {
            alert("برجاء كتابة اللون والمقاس قبل إضافة المنتج للطلب.");
            return; 
        }

        const item = { product, color, size, qty };
        cartItems.push(item);
        
        renderCart();
        
        // تفريغ الحقول
        document.getElementById('productColor').value = '';
        document.getElementById('productSize').value = '';
        document.getElementById('productQty').value = '1';
    }

    function renderCart() {
        const cartDisplay = document.getElementById('cartDisplay');
        const cartList = document.getElementById('cartList');
        
        if (cartItems.length === 0) {
            cartDisplay.style.display = 'none';
            return;
        }

        cartDisplay.style.display = 'block';
        cartList.innerHTML = '';

        cartItems.forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div>
                    <strong>${item.product}</strong><br>
                    <small>اللون: ${item.color} | المقاس: ${item.size} | الكمية: ${item.qty}</small>
                </div>
                <span class="remove-item" onclick="removeFromCart(${index})">&times;</span>
            `;
            cartList.appendChild(li);
        });
    }

    window.removeFromCart = function(index) {
        cartItems.splice(index, 1);
        renderCart();
    }

    // ==========================================
    // 3. دالة تنظيف رقم الموبايل
    // ==========================================
    function cleanPhoneNumber(phone) {
        let cleaned = phone.replace(/[\s\-\(\)]/g, '');
        
        if (cleaned.startsWith('+20')) {
            cleaned = '0' + cleaned.substring(3);
        } else if (cleaned.startsWith('0020')) {
            cleaned = '0' + cleaned.substring(4);
        } else if (cleaned.startsWith('20') && cleaned.length > 10) {
            cleaned = '0' + cleaned.substring(2);
        }
        
        return cleaned;
    }

    // ==========================================
    // 4. كود إرسال الطلب النهائي لجوجل شيت
    // ==========================================
    const orderForm = document.getElementById('orderForm');
    
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault(); 
        
        // التحقق من أن السلة فيها منتجات
        if (cartItems.length === 0) {
            alert("برجاء إضافة منتج واحد على الأقل للطلب أولاً.");
            return;
        }

        // جلب بيانات العميل
        const name = document.getElementById('customerName').value.trim();
        const rawPhone1 = document.getElementById('customerPhone1').value.trim();
        const rawPhone2 = document.getElementById('customerPhone2').value.trim();
        const address = document.getElementById('customerAddress').value.trim();
        const notes = document.getElementById('orderNotes').value.trim() || 'لا يوجد';

        // التحقق من الاسم
        if (!name) {
            alert("برجاء إدخال الاسم بالكامل.");
            return;
        }

        // تنظيف الأرقام
        const phone1 = cleanPhoneNumber(rawPhone1);
        const phone2 = rawPhone2 ? cleanPhoneNumber(rawPhone2) : 'لا يوجد';

        // التحقق من رقم الموبايل الأساسي (بعد التنظيف يكون 11 رقم ويبدأ بـ 01)
        const phoneRegex = /^01[0125][0-9]{8}$/;
        
        if (!phoneRegex.test(phone1)) {
            alert("برجاء إدخال رقم الموبايل الأساسي بشكل صحيح.\n(مثال: 01012345678 أو +201012345678)");
            return;
        }

        // التحقق من رقم الموبايل الإضافي لو مكتوب
        if (phone2 !== 'لا يوجد' && !phoneRegex.test(phone2)) {
            alert("برجاء إدخال رقم الموبايل الإضافي بشكل صحيح.\n(مثال: 01012345678 أو +201012345678)");
            return;
        }

        // التحقق من العنوان
        if (!address) {
            alert("برجاء إدخال العنوان بالتفصيل.");
            return;
        }

        // تجميع المنتجات
        let productsData = cartItems.map(item => ({
            product: item.product,
            color: item.color,
            size: item.size,
            qty: item.qty
        }));

        const orderData = {
            name: name,
            phone1: phone1,
            phone2: phone2,
            address: address,
            products: productsData,
            notes: notes
        };

        // ⚠️ الرابط الجديد الخاص بك ⚠️
        const scriptURL = 'https://script.google.com/macros/s/AKfycbyQz5ECfXEtzniiigHR06CaxgD2Logsq8sQYxeV3V3Iqjj3pdDePc577ex4SeMHulGMPw/exec'; 

        const submitBtn = document.querySelector('.btn-confirm');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'جاري إرسال الطلب...';
        submitBtn.disabled = true;

        // إرسال البيانات
        fetch(scriptURL, {
            method: 'POST',
            mode: 'no-cors', 
            headers: {
                'Content-Type': 'text/plain'
            },
            body: JSON.stringify(orderData)
        })
        .then(response => {
            alert("تم استلام طلبك بنجاح! هنتواصل معاكي في أقرب وقت لتأكيد الشحن. شكراً لكومفلو ❤️");
            
            orderForm.reset();
            cartItems = [];
            renderCart();
            
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        })
        .catch(error => {
            alert("للأسف حصلت مشكلة أثناء الإرسال. برجاء المحاولة مرة أخرى أو التواصل معنا مباشرة.");
            console.error('Error!', error.message);
            
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        });
    });
});

// ==========================================
// 5. دالة زر "اطلبي الآن" السريع في المنتجات
// ==========================================
function quickOrder(productName, color = '') {
    const select = document.getElementById('productSelect');
    
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value.includes(productName)) {
            select.selectedIndex = i;
            break;
        }
    }
    
    if (color && color !== 'الأساسي') {
        document.getElementById('productColor').value = color;
    }
    
    document.getElementById('order-section').scrollIntoView({ behavior: 'smooth' });
}