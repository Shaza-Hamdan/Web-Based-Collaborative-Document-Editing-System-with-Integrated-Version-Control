import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";

type Repo = {
  id: string;
  name: string;
  role: "Owner" | "Collaborator";
};

function Dashboard() {
  const [ownedRepos, setOwnedRepos] = useState<Repo[]>([]);
  const [collabRepos, setCollabRepos] = useState<Repo[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRepos();
  }, []);

  async function fetchRepos() {
    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await fetch(
      "http://localhost:5068/api/repository/RepoInfo",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) return;

    const data: Repo[] = await response.json();
    
    setOwnedRepos(data.filter(repo => repo.role === "Owner"));
    setCollabRepos(data.filter(repo => repo.role === "Collaborator"));
  }

  const hasAnyRepos = ownedRepos.length > 0 || collabRepos.length > 0;

  return (
    <div className={styles.container}>
      {/* Animated background orbs */}
      <div className={styles.orb1}></div>
      <div className={styles.orb2}></div>
      <div className={styles.orb3}></div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            Панель управления
          </h1>
          <p className={styles.subtitle}>Управляйте своими репозиториями</p>
        </div>

        {!hasAnyRepos ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🚀</div>
            <h2>Начните своё путешествие</h2>
            <p>Создайте первый репозиторий и приглашайте соавторов</p>
            <button
              className={styles.createBtn}
              onClick={() => navigate("/create-repo")}
            >
              + Создать репозиторий
            </button>
          </div>
        ) : (
          <>
            <div className={styles.createButtonContainer}>
              <button
                className={styles.createBtn}
                onClick={() => navigate("/create-repo")}
              >
                + Создать репозиторий
              </button>
            </div>

            <div className={styles.twoColumns}>
              
              {/* LEFT COLUMN - OWNER */}
              <div className={`${styles.column} ${styles.ownerColumn}`}>
                <div className={styles.columnHeader}>
                  <div className={styles.columnIconWrapper}>
                    <span className={styles.columnIcon}>🗂️</span>
                  </div>
                  <div className={styles.columnTitleInfo}>
                    <h2>Мои репозитории</h2>
                    <span className={styles.repoCount}>{ownedRepos.length} реп.</span>
                  </div>
                  <div className={styles.rolePill}>Владелец</div>
                </div>
                
                {ownedRepos.length === 0 ? (
                  <div className={styles.emptyColumn}>
                    <span>📭</span>
                    <p>У вас пока нет своих репозиториев</p>
                  </div>
                ) : (
                  <div className={styles.repoList}>
                    {ownedRepos.map((repo, index) => (
                      <div
                        key={repo.id}
                        className={`${styles.card} ${styles.ownerCard}`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                        onClick={() => navigate(`/repo/${repo.id}`, { state: { role: "owner" } })}
                      >
                        <div className={styles.cardIcon}>📁</div>
                        <div className={styles.cardContent}>
                          <div className={styles.repoName}>{repo.name}</div>
                          <div className={styles.cardMeta}>Создан вами</div>
                        </div>
                        <div className={styles.cardArrow}>→</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN - COLLABORATOR */}
              <div className={`${styles.column} ${styles.collabColumn}`}>
                <div className={styles.columnHeader}>
                  <div className={styles.columnIconWrapper}>
                    <span className={styles.columnIcon}>👥</span>
                  </div>
                  <div className={styles.columnTitleInfo}>
                    <h2>Доступные репозитории</h2>
                    <span className={styles.repoCount}>{collabRepos.length} реп.</span>
                  </div>
                  <div className={styles.rolePill}>Участник</div>
                </div>
                
                {collabRepos.length === 0 ? (
                  <div className={styles.emptyColumn}>
                    <span>🤝</span>
                    <p>Примите приглашение, чтобы увидеть репозитории здесь</p>
                  </div>
                ) : (
                  <div className={styles.repoList}>
                    {collabRepos.map((repo, index) => (
                      <div
                        key={repo.id}
                        className={`${styles.card} ${styles.collabCard}`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                        onClick={() => navigate(`/repo/${repo.id}`, { state: { role: "collaborator" } })}
                      >
                        <div className={styles.cardIcon}>📂</div>
                        <div className={styles.cardContent}>
                          <div className={styles.repoName}>{repo.name}</div>
                          <div className={styles.cardMeta}>Приглашён участником</div>
                        </div>
                        <div className={styles.cardArrow}>→</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;