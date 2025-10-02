document.addEventListener('DOMContentLoaded', function() {
    // === KHAI BÁO BIẾN ===
    const productListBody = document.getElementById('product-list-body');
    const addProductForm = document.getElementById('add-product-form');
    const categorySelectContainer = document.getElementById('category-select-container');
    const selectButton = categorySelectContainer.querySelector('.select-button');
    const selectValue = categorySelectContainer.querySelector('.select-value');
    const selectDropdown = categorySelectContainer.querySelector('.select-dropdown');
    const API_BASE_URL = 'http://localhost:3000';

    const confirmOverlay = document.getElementById('confirm-overlay');
    const confirmModal = document.getElementById('confirm-modal');
    const modalMessage = document.getElementById('modal-message');
    const confirmBtn = document.getElementById('confirm-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    
    let productIdToDelete = null; 

    // === CÁC HÀM XỬ LÝ ===

    // Hàm tải và hiển thị tất cả sản phẩm
    function loadProducts() {
        // TỐI ƯU: Hiển thị trạng thái đang tải
        productListBody.innerHTML = '<tr><td colspan="3">Đang tải danh sách sản phẩm...</td></tr>';

        fetch(`${API_BASE_URL}/api/products`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(products => {
                productListBody.innerHTML = ''; // Xóa dòng "Đang tải..."
                if (products.length === 0) {
                    productListBody.innerHTML = '<tr><td colspan="3">Chưa có sản phẩm nào.</td></tr>';
                    return;
                }
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

    // Hàm tải danh mục
    function loadCategories() {
        fetch(`${API_BASE_URL}/api/categories`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(categories => {
                selectDropdown.innerHTML = '';
                categories.forEach(category => {
                    const option = document.createElement('label');
                    option.innerHTML = `<input type="checkbox" value="${category.id}"> ${category.name}`;
                    selectDropdown.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Lỗi khi tải danh mục:', error);
                selectValue.textContent = 'Lỗi tải danh mục';
            });
    }

    // === GẮN CÁC SỰ KIỆN ===
    
    // Sự kiện cho Custom Select Dropdown
    selectButton.addEventListener('click', () => categorySelectContainer.classList.toggle('open'));
    window.addEventListener('click', e => !categorySelectContainer.contains(e.target) && categorySelectContainer.classList.remove('open'));
    selectDropdown.addEventListener('change', () => {
        const selected = selectDropdown.querySelectorAll('input:checked');
        if (selected.length === 0) selectValue.textContent = 'Chọn danh mục...';
        else if (selected.length === 1) selectValue.textContent = selected[0].parentElement.textContent.trim();
        else selectValue.textContent = `${selected.length} danh mục đã chọn`;
    });

    // Sự kiện click trên bảng sản phẩm để Xóa/Sửa
    productListBody.addEventListener('click', event => {
        const target = event.target, row = target.closest('tr');
        if (!row || !row.dataset.productId) return; // Bỏ qua nếu click vào dòng "Đang tải..."
        const productId = row.dataset.productId, productName = row.dataset.productName;

        if (target.classList.contains('btn-delete')) {
            productIdToDelete = productId;
            modalMessage.innerHTML = `Bạn có chắc chắn muốn xóa sản phẩm <strong>"${productName}"</strong> không?`;
            confirmOverlay.classList.add('active');
            confirmModal.classList.add('active');
        }
        if (target.classList.contains('btn-edit')) alert(`Chức năng Sửa cho "${productName}" sẽ được làm sau!`);
    });

    // Các hàm và sự kiện cho Modal
    function hideModal() {
        confirmOverlay.classList.remove('active');
        confirmModal.classList.remove('active');
        productIdToDelete = null;
    }

    confirmBtn.addEventListener('click', () => {
        if (productIdToDelete) {
            fetch(`${API_BASE_URL}/api/products/${productIdToDelete}`, { method: 'DELETE' })
                .then(response => {
                    if (!response.ok) throw new Error('Xóa thất bại');
                    return response.json();
                })
                .then(data => {
                    alert(data.message || 'Xóa thành công!');
                    hideModal();
                    loadProducts();
                })
                .catch(error => {
                    console.error('Lỗi khi xóa sản phẩm:', error);
                    alert('Đã xảy ra lỗi khi xóa sản phẩm.');
                    hideModal();
                });
        }
    });

    cancelBtn.addEventListener('click', hideModal);
    confirmOverlay.addEventListener('click', hideModal);

    // Sự kiện submit của form thêm sản phẩm
    addProductForm.addEventListener('submit', event => {
        event.preventDefault();
        const submitButton = addProductForm.querySelector('button[type="submit"]');

        const formData = new FormData();
        formData.append('name', document.getElementById('product-name').value);
        formData.append('price', document.getElementById('product-price').value);
        formData.append('image', document.getElementById('product-image').files[0]);
        
        const selectedCategories = Array.from(selectDropdown.querySelectorAll('input:checked')).map(cb => cb.value);
        if (selectedCategories.length === 0) {
            alert('Vui lòng chọn ít nhất một danh mục.');
            return;
        }
        selectedCategories.forEach(cat => formData.append('category', cat));
        
        // TỐI ƯU: Vô hiệu hóa nút bấm để tránh click nhiều lần
        submitButton.disabled = true;
        submitButton.textContent = 'Đang thêm...';

        fetch(`${API_BASE_URL}/api/products`, { method: 'POST', body: formData })
            .then(response => {
                if (!response.ok) throw new Error('Thêm sản phẩm thất bại');
                return response.json();
            })
            .then(data => {
                alert(`Thêm thành công sản phẩm: ${data.name}`);
                addProductForm.reset();
                selectValue.textContent = 'Chọn danh mục...';
                loadProducts();
            })
            .catch(error => {
                console.error('Lỗi khi thêm sản phẩm:', error);
                alert('Đã xảy ra lỗi khi thêm sản phẩm.');
            })
            .finally(() => {
                // TỐI ƯU: Bật lại nút bấm sau khi hoàn tất
                submitButton.disabled = false;
                submitButton.textContent = 'Thêm sản phẩm';
            });
    });

    // === CHẠY CÁC HÀM KHỞI TẠO ===
    loadProducts();
    loadCategories();
});