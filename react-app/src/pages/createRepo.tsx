import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CreateRepo.module.css";

function CreateRepo() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function handleCreate() {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5068/api/repository/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Не удалось создать репозиторий");
      }

      setMessage("Репозиторий успешно создан 🎉");

      setTimeout(() => navigate("/dashboard"), 1000);

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
        <h2 className={styles.title}>Создать репозиторий</h2>

        <input
          className={styles.input}
          placeholder="Название репозитория"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button className={styles.button} onClick={handleCreate}>
          Создать
        </button>

        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
}

export default CreateRepo;