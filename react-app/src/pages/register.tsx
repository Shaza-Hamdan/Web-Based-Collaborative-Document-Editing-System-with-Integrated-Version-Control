import { useState } from "react";
import { register } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Register.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Register() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  async function handleRegister() {
    try {
      const result = await register(userName, email, password, phoneNumber);
      setMessage(result);

      setTimeout(() => {
        navigate("/login");
      }, 1000);
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
        placeholder="Имя пользователя"
        onChange={(e) => setUserName(e.target.value)}
      />

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
        
      <input
        className={styles.input}
        placeholder="Номер телефона"
        onChange={(e) => setPhoneNumber(e.target.value)}
      />

      <button className={styles.button} onClick={handleRegister}>
        Зарегистрироваться
      </button>

      {message && <p className={styles.message}>{message}</p>}

      <p className={styles.link}>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </div>
  </div>
);
}

export default Register;