document.addEventListener('DOMContentLoaded', function() {
    // === KHAI BÁO BIẾN ===
    const productListBody = document.getElementById('product-list-body');
    const addProductForm = document.getElementById('add-product-form');
    const categorySelectContainer = document.getElementById('category-select-container');
    const selectButton = categorySelectContainer.querySelector('.select-button');
    const selectValue = categorySelectContainer.querySelector('.select-value');
    const selectDropdown = categorySelectContainer.querySelector('.select-dropdown');
    const API_BASE_URL = 'https://flower-shop-back-end.onrender.com';

    const confirmOverlay = document.getElementById('confirm-overlay');
    const confirmModal = document.getElementById('confirm-modal');
    const modalMessage = document.getElementById('modal-message');
    const confirmBtn = document.getElementById('confirm-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    let productIdToDelete = null; 

    // === CÁC HÀM XỬ LÝ ===

    // Hàm tải và hiển thị tất cả sản phẩm
    function loadProducts() {
        fetch(`${API_BASE_URL}/api/products`)
            .then(response => response.json())
            .then(products => {
                productListBody.innerHTML = ''; 
                products.forEach(product => {
                    const row = document.createElement('tr');
                    row.dataset.productId = product.id;
                    row.dataset.productName = product.name;
                    row.innerHTML = `
                        <td>${product.name}</td>
                        <td>${formatCurrency(product.price)}</td>
                        <td>
                            <button class="btn btn-edit">Sửa</button>
                            <button class="btn btn-delete">Xóa</button>
                        </td>
                    `;
                    productListBody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Lỗi khi tải sản phẩm:', error);
                productListBody.innerHTML = '<tr><td colspan="3">Không thể tải danh sách sản phẩm. Vui lòng kiểm tra lại server back-end.</td></tr>';
            });
    }

    // Hàm tải danh mục và tạo các checkbox
    function loadCategories() {
        fetch(`${API_BASE_URL}/api/categories`)
            .then(response => response.json())
            .then(categories => {
                selectDropdown.innerHTML = '';
                categories.forEach(category => {
                    const option = document.createElement('label');
                    option.innerHTML = `<input type="checkbox" value="${category.id}"> ${category.name}`;
                    selectDropdown.appendChild(option);
                });
            });
    }

    // === GẮN CÁC SỰ KIỆN ===
    
    // Sự kiện cho Custom Select Dropdown
    selectButton.addEventListener('click', () => {
        categorySelectContainer.classList.toggle('open');
    });

    window.addEventListener('click', function(e) {
        if (!categorySelectContainer.contains(e.target)) {
            categorySelectContainer.classList.remove('open');
        }
    });

    selectDropdown.addEventListener('change', function() {
        const selectedCheckboxes = selectDropdown.querySelectorAll('input[type="checkbox"]:checked');
        if (selectedCheckboxes.length === 0) {
            selectValue.textContent = 'Chọn danh mục...';
        } else if (selectedCheckboxes.length === 1) {
            selectValue.textContent = selectedCheckboxes[0].parentElement.textContent.trim();
        } else {
            selectValue.textContent = `${selectedCheckboxes.length} danh mục đã chọn`;
        }
    });

    // Sự kiện click trên bảng sản phẩm để Xóa/Sửa
    productListBody.addEventListener('click', function(event) {
        const target = event.target;
        const row = target.closest('tr');
        if (!row) return;

        const productId = row.dataset.productId;
        const productName = row.dataset.productName;

        if (target.classList.contains('btn-delete')) {
            productIdToDelete = productId;
            modalMessage.innerHTML = `Bạn có chắc chắn muốn xóa sản phẩm <strong>"${productName}"</strong> không? Hành động này không thể hoàn tác.`;
            confirmOverlay.classList.add('active');
            confirmModal.classList.add('active');
        }

        if (target.classList.contains('btn-edit')) {
            alert(`Chức năng Sửa cho sản phẩm "${productName}" sẽ được phát triển ở bước tiếp theo!`);
        }
    });

    // Hàm ẩn modal
    function hideModal() {
        confirmOverlay.classList.remove('active');
        confirmModal.classList.remove('active');
        productIdToDelete = null;
    }

    // Gắn sự kiện cho các nút trong modal
    confirmBtn.addEventListener('click', function() {
        if (productIdToDelete) {
            fetch(`${API_BASE_URL}/api/products/${productIdToDelete}`, {
                method: 'DELETE',
            })
            .then(response => response.json())
            .then(data => {
                console.log(data.message);
                hideModal();
                loadProducts();
            })
            .catch(error => {
                console.error('Lỗi khi xóa sản phẩm:', error);
                hideModal();
            });
        }
    });

    cancelBtn.addEventListener('click', hideModal);
    confirmOverlay.addEventListener('click', hideModal);

    // Sự kiện submit của form thêm sản phẩm
    addProductForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData();
        
        formData.append('name', document.getElementById('product-name').value);
        formData.append('price', document.getElementById('product-price').value);
        formData.append('image', document.getElementById('product-image').files[0]);
        
        const selectedCheckboxes = selectDropdown.querySelectorAll('input[type="checkbox"]:checked');
        if (selectedCheckboxes.length === 0) {
            alert('Vui lòng chọn ít nhất một danh mục.');
            return;
        }
        selectedCheckboxes.forEach(checkbox => {
            formData.append('category', checkbox.value);
        });

        fetch(`${API_BASE_URL}/api/products`, {
            method: 'POST',
            body: formData, 
        })
        .then(response => response.json())
        .then(data => {
            console.log('Thêm thành công:', data);
            addProductForm.reset();
            selectValue.textContent = 'Chọn danh mục...';
            selectDropdown.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => cb.checked = false);
            loadProducts();
        })
        .catch(error => console.error('Lỗi khi thêm sản phẩm:', error));
    });

    // === CHẠY CÁC HÀM KHỞI TẠO ===
    loadProducts();
    loadCategories();
});