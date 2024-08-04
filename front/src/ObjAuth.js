class ObjAuth {
  static async isAuthenticated() {
    const token = this.getToken();
    if (!token) return { authenticated: false, user: null };

    const response = await fetch("/api/check-auth", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { authenticated: true, user: data };
    }

    return { authenticated: false, user: null };
  }

  static getToken() {
    return localStorage.getItem("token");
  }

  static setToken(token) {
    localStorage.setItem("token", token);
  }

  static clearToken() {
    localStorage.removeItem("token");
  }
}

export default ObjAuth;
