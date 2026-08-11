import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import styles from "./FilePage.module.css";

function FilePage() {
  const { repoId, fileId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [content, setContent] = useState("");
  const [branchName, setBranchName] = useState(location.state?.branch || "main");
  const [role, setRole] = useState<string | null>(null);

  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<any>(null);

  const isMainProtected = branchName === "main" && role !== "Owner";
  const [showPublish, setShowPublish] = useState(false);
  const [publicSummary, setPublicSummary] = useState("");

  useEffect(() => {
    if (fileId && branchName) fetchFile();
  }, [fileId, branchName]);

  useEffect(() => {
    if (repoId) fetchRepoRole();
  }, [repoId]);

  // ===== FETCH HISTORY =====
  async function loadHistory() {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5068/api/files/files/${fileId}/history?repositoryId=${repoId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) return;

    const data = await res.json();

    setHistory(data);
    setShowHistory(true);
  }

  // ===== FETCH FILE =====
  async function fetchFile() {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5068/api/files/${fileId}?branchName=${branchName}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      alert("Не удалось загрузить файл");
      return;
    }

    const data = await res.json();
    setContent(data.content);
  }

  // ===== ROLE =====
  async function fetchRepoRole() {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch(
      `http://localhost:5068/api/repository/${repoId}/openrepo`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) return;

    const repo = await res.json();

    const payload = JSON.parse(atob(token.split(".")[1]));
    const userId = payload.nameid;

    const isOwner = repo.ownerId === userId;

    if (isOwner) {
      setRole("Owner");
    } else {
      const collab = repo.collaborators.find(
        (c: any) => c.userId === userId
      );

      setRole(collab?.role === 1 ? "Collaborator" : null);
    }
  }

  // ===== SAVE =====
  async function handleSave() {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5068/api/files/EditFile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        repoId,
        fileId,
        branchName: branchName.trim(),
        content,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      alert(err);
      return;
    }

    toast.success("Сохранено успешно");

    navigate(`/repo/${repoId}`, {
      state: { branch: branchName, focusMR: true },
    });
  }

  async function handlePublish() {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5068/api/files/${fileId}/publish`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          summary: publicSummary,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      toast.error(err);
      return;
    }

    toast.success("Файл опубликован 🌍");

    setShowPublish(false);
    setPublicSummary("");
  }

  return (
      <div className={styles.container}>
    <div className={styles.orb1}></div>
    <div className={styles.orb2}></div>
    <div className={styles.orb3}></div>
      {/* HEADER */}
      <div className={styles.header}>
        <h2 className={styles.title}>Редактор файлов</h2>
      </div>

      {isMainProtected && (
        <p className={styles.dangerText}>
          ⚠️ Вы не можете редактировать основную ветку. Создайте новую ветку.
        </p>
      )}

      <div className={styles.editorCard}>
        {/* BRANCH INPUT */}
        <div className={styles.branchBadge}>
          🌿 {branchName}
        </div>

        {/* TEXT EDITOR */}
        <textarea
          className={styles.textarea}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isMainProtected}
        />

        {/* ACTIONS */}
        <div style={{ marginTop: "12px" }}>
          <button
            className={`${styles.button} ${styles.saveButton}`}
            onClick={handleSave}
            disabled={isMainProtected}
          >
            Сохранить
          </button>

          <button
            className={`${styles.button} ${styles.secondaryButton}`}
            onClick={loadHistory}
          >
            📜 История версий
          </button>

          {role === "Owner" && (
            <button
              className={styles.publishbutton}
              onClick={() => setShowPublish(true)}
            >
              🌍 Опубликовать
            </button>
          )}
        </div>
      </div>

      {/* HISTORY */}
      {showHistory && (
        <div className={styles.historyPanel}>
          <div className={styles.historyHeader}>
            <h3>📜 История документа</h3>
            <button
              className={`${styles.button} ${styles.secondaryButton}`}
              onClick={() => setShowHistory(false)}
            >
              Закрыть
            </button>
          </div>

          {history.length === 0 ? (
            <p className={styles.emptyState}>История не найдена</p>
          ) : (
            <div className={styles.timeline}>
              {history.map((h, i) => (
                <div key={i} className={styles.timelineItem}>
                  <div className={styles.dot} />

                  <div className={styles.commitCard}>
                    <div className={styles.commitTop}>
                      <b className={styles.commitMessage}>{h.message}</b>
                    </div>

                    <div className={styles.commitMeta}>
                      👤 {h.author} • {new Date(h.date).toLocaleString()}
                    </div>

                    <button
                      className={`${styles.button} ${styles.secondaryButton}`}
                      onClick={() => setSelectedVersion(h)}
                    >
                      Просмотреть версию
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VERSION VIEWER */}
      {selectedVersion && (
        <div className={styles.versionSidePanel}>
          <div className={styles.versionSideHeader}>
            <div>
              <h3>📄 Снимок файла</h3>
              <p className={styles.versionMeta}>
                {selectedVersion.message} • {selectedVersion.author} •{" "}
                {new Date(selectedVersion.date).toLocaleString()}
              </p>
            </div>

            <button
              className={`${styles.button} ${styles.secondaryButton}`}
              onClick={() => setSelectedVersion(null)}
            >
              Закрыть
            </button>
          </div>

          <div className={styles.versionSideContent}>
            <pre>{selectedVersion.content}</pre>
          </div>
        </div>
      )}

      {/* PUBLISH MODAL */}
      {showPublish && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>🌍 Опубликовать публично</h3>

            <p className={styles.modalSubtitle}>
              Добавьте краткое описание, чтобы другие поняли, о чём этот файл.
            </p>

            <textarea
              className={styles.textarea}
              placeholder="Напишите описание..."
              value={publicSummary}
              onChange={(e) => setPublicSummary(e.target.value)}
            />

            <div className={styles.modalActions}>
              <button
                className={`${styles.button} ${styles.secondaryButton}`}
                onClick={handlePublish}
              >
                Опубликовать
              </button>

              <button
                className={`${styles.button} ${styles.secondaryButton}`}
                onClick={() => setShowPublish(false)}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FilePage;