export const extractPlainTextFromHtml = (html: string): string => {
  // Tạo một DOM parser tạm thời
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  // Lấy text content thuần
  return tempDiv.textContent || tempDiv.innerText || "";
};