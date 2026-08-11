import styles from "./Landing.module.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../images/logo.png";

function Landing() {
  const navigate = useNavigate();
  const [active, setActive] = useState("Роли");

  return (
    <div className={styles.container}>
      {/* Navbar inline */}
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.logo}>
            <img src={logo} alt="Логотип" className={styles.logoImage} />
          </div>
          <div className={styles.navLinks}>
            <a className={styles.navLink}>Возможности</a>
            <a className={styles.navLink}>Принцип работы</a>
            <a className={styles.navLink}>Цены</a>
            <a className={styles.navLink}>О нас</a>
          </div>
          <div className={styles.navButtons}>
            <div className={styles.navButtons}>
              <select className={styles.languageSelect}>
                <option>EN</option>
                <option>RU</option>
              </select>
            </div>
          </div>
        </div>
      </nav>
      
      {/* glow */}
      <div className={styles.goldGlow}></div>

      {/* HERO */}
      <section className={styles.heroCentered}>
        <h1>Где наши идеи растут вместе</h1>

        <p>
          Пишите статьи, научные работы и истории — сотрудничайте с другими, отслеживайте каждое изменение и возвращайтесь к любой версии в любое время.

        </p>

        <div className={styles.actions}>
          <button
            className={styles.primary}
            onClick={() => navigate("/login")}
          >
            Начать работу с Collabia →
          </button>
        </div>
      </section>

      {/* WHY SECTION */}
      <section className={styles.why}>
        <h2>Почему выбирают Collabia?</h2>
        <div className={styles.grid}>
          <div className={styles.card}>
             <span className={styles.cardTitle}>🛡️ Защищённое рабочее пространство</span>
            <p>Каждый документ имеет чёткое направление. Владельцы определяют финальную форму документа</p>
          </div>

          <div className={styles.card}>
            <span className={styles.cardTitleBranch}>🌿 Работа в ветках</span>
            <p>Работайте над своими идеями независимо, не мешая другим</p>
          </div>

          <div className={styles.card}>
            <span className={styles.cardTitle}>🤝 Объединяйте усилия</span>
            <p>Обзор и объединение предложений в единую, понятную и доступную версию</p>
          </div>

          <div className={styles.card}>
            <span className={styles.cardTitle}>📜 Ваша работа сохранена</span>
            <p>Каждый шаг вашего документа фиксируется, чтобы вы могли вернуться, сравнить или восстановить любой момент</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className={styles.bannerSection}>
        <div className={styles.banner}>
          <div className={styles.whyMenu}>
            {["Роли", "Ветвление", "Слияние", "Полный цикл работы"].map((item) => (
              <div
                key={item}
                className={`${styles.whyItem} ${active === item ? styles.active : ""}`}
                onMouseEnter={() => setActive(item)}
              >
                {item}
              </div>
            ))}
          </div>

          <div className={styles.bannerContent}>
            {active === "Роли" && (
              <p>
                Репозиторий использует модель разрешений на основе ролей: Владельцы обладают административными привилегиями, 
                Участники работают в среде веток, а Гости имеют доступ только для чтения к утверждённому контенту
              </p>
            )}

            {active === "Ветвление" && (
              <p>
                Каждый участник работает изолированно, поэтому идеи могут развиваться безопасно, не влияя на основной документ
              </p>
            )}

            {active === "Слияние" && (
              <p>
                Вклад участников требует одобрения владельца через запрос на слияние перед окончательным объединением
              </p>
            )}

            {active === "Полный цикл работы" && (
              <p>
                От создания до публикации каждый шаг структурирован, отслеживается и может быть отменён
              </p>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <h2>Готовы начать создавать вместе?</h2>

        <button
          className={styles.primary}
          onClick={() => navigate("/login")}
        >
          Начать работу с Collabia →
        </button>
      </section>

    </div>
  );
}

export default Landing;