import { useState } from "react";
import { login, guestLogin } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "./Login.module.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin() {
    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err: any) {
      setMessage(err.message);
    }
  }

  async function handleGuestLogin() {
    try {
      const data = await guestLogin();
      localStorage.setItem("token", data.token);
      navigate("/PublicFiles");
    } catch (err: any) {
      setMessage(err.message);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.orb1}></div>
      <div className={styles.orb2}></div>
      <div className={styles.orb3}></div>
      
      <div className={styles.card}>
        <h1 className={styles.title}>Добро пожаловать в Collabia</h1>

        <input
          className={styles.input}
          placeholder="Электронная почта"
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className={styles.passwordWrapper}>
          <input
            className={styles.input}
            type={showPassword ? "text" : "password"}
            placeholder="Пароль"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="button"
            className={styles.eyeBtn}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <button className={styles.button} onClick={handleLogin}>
          Войти
        </button>

        <button
          className={styles.guestButton}
          onClick={handleGuestLogin}
        >
          Продолжить как гость
        </button>

        <p className={styles.link}>
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>

        {message && <p className={styles.error}>{message}</p>}
      </div>
    </div>
  );
}

export default Login;