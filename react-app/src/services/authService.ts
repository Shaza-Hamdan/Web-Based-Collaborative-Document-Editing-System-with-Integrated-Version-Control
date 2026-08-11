const API_URL = "http://localhost:5068/api/Registration"; // ⚠️ match your backend port

// 🔹 REGISTER
export async function register(
  userName: string,
  email: string,
  password: string,
  phoneNumber: string
) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userName,
      email,
      password,
      phoneNumber,
    }),
  });

  const data = await response.text(); // backend returns string

  if (!response.ok) {
    throw new Error(data);
  }

  return data;
}

// 🔹 LOGIN
export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const text = await response.text(); // 👈 IMPORTANT

  if (!response.ok) {
    throw new Error(text); // 👈 shows real backend message
  }

  return JSON.parse(text); // success case { token }
}

export async function guestLogin() {
  const response = await fetch(`${API_URL}/guest-login`, {
    method: "POST",
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text);
  }

  return JSON.parse(text); // { token }
}