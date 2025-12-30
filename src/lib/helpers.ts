export function removeVietnameseAccents(str: string): string {
  if (!str) return "";

  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");

  // Remove extra spaces
  str = str.replace(/\s+/g, " ");
  str = str.trim();

  return str;
}

/**
 * So sánh 2 chuỗi có giống nhau không (không phân biệt dấu)
 * @param str1 - Chuỗi thứ nhất
 * @param str2 - Chuỗi thứ hai
 * @returns true nếu 2 chuỗi giống nhau
 */
export function compareVietnamese(str1: string, str2: string): boolean {
  return removeVietnameseAccents(str1) === removeVietnameseAccents(str2);
}

/**
 * Kiểm tra chuỗi có chứa từ khóa không (không phân biệt dấu)
 * @param str - Chuỗi cần kiểm tra
 * @param keyword - Từ khóa tìm kiếm
 * @returns true nếu chuỗi chứa từ khóa
 */
export function searchVietnamese(str: string, keyword: string): boolean {
  if (!str || !keyword) return false;
  return removeVietnameseAccents(str).includes(removeVietnameseAccents(keyword));
}
