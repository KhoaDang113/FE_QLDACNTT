// Helper function để lấy token từ localStorage hoặc cookies
export const getAccessToken = (): string | null => {
  let token = localStorage.getItem("accessToken");

  if (!token) {
    const cookies = document.cookie.split(";");
    const accessTokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("accessToken=")
    );

    if (accessTokenCookie) {
      token = accessTokenCookie.split("=")[1];
      if (token) {
        localStorage.setItem("accessToken", token);
      }
    }
  }

  return token;
};
