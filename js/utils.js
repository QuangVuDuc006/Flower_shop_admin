/**
 * Định dạng một số thành chuỗi tiền tệ Việt Nam (VND).
 * @param {number | string} number - Số tiền cần định dạng.
 * @returns {string} - Chuỗi đã được định dạng (ví dụ: 1.000.000 ₫).
 */
function formatCurrency(number) {
    const numericPrice = Number(number);
    if (isNaN(numericPrice)) {
        return number; // Trả về nguyên bản nếu không phải là số
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numericPrice);
}