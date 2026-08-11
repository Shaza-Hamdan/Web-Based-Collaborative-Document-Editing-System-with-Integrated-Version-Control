import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import styles from "./RepoPage.module.css";

type Notification = {
  id: string;
  message: string;
  createdAt: string;
  relatedRepositoryId: string | null;
  relatedBranchName: string | null;
  relatedMergeRequestId: string | null;
};

function RepoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const branchFromNav = location.state?.branch;
  const focusMR = location.state?.focusMR;

  const [role, setRole] = useState<string | null>(null);
  const isOwner = role === "Owner";

  const [files, setFiles] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [fileName, setFileName] = useState("");

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const [branch, setBranch] = useState<string | null>(null);
  const [branchInput, setBranchInput] = useState("");
  const [branches, setBranches] = useState<string[]>([]);

  // Notification states (moved from Dashboard)
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(true);
  const [isBehind, setIsBehind] = useState(false);
  const [commitsBehind, setCommitsBehind] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const hasShownToast = useRef(false);

  useEffect(() => {
    fetchBranches();
    fetchRepoNotifications(); // Fetch notifications for this repo
  }, [id]);

  useEffect(() => {
    fetchRepoRole();
  }, [id]);

    useEffect(() => {
    if (branch && !isOwner) {
      checkBranchStatus();
    }
  }, [branch]);

  useEffect(() => {
    if (branchFromNav) {
      setBranch(branchFromNav);
    } else if (isOwner) {
      setBranch("main");
    } else {
      setBranch(null);
    }
  }, [isOwner, id, branchFromNav]);

  useEffect(() => {
    if (branch) fetchFiles();
  }, [branch]);

  useEffect(() => {
    if (search.length < 2) {
      setResults([]);
      return;
    }

    const delay = setTimeout(() => {
      searchUsers();
    }, 300);

    return () => clearTimeout(delay);
  }, [search]);

  useEffect(() => {
    if (role === null) return;

    if (focusMR && !hasShownToast.current && role === "Collaborator") {
      toast.info("Теперь вы можете создать запрос на слияние");
      hasShownToast.current = true;
    }
  }, [focusMR, role]);

  async function checkBranchStatus() {
    const token = localStorage.getItem("token");
    
    try {
      const response = await fetch(
        `http://localhost:5068/api/repository/${id}/${branch}/status`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setIsBehind(data.isBehind);
        setCommitsBehind(data.commitsBehind);
      }
    } catch (error) {
      console.error("Failed to check branch status:", error);
    }
  }

  // NEW: Sync branch with main
  async function syncBranch() {
    const token = localStorage.getItem("token");
    setIsSyncing(true);
    
    try {
      const response = await fetch(
        `http://localhost:5068/api/repository/sync?repoId=${id}&branchName=${branch}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message || "Ветка обновлена!");
        setIsBehind(false);
        fetchFiles(); // Refresh file list
      } else if (response.status === 409) {
        toast.error(data.message || "Conflicts detected! Please resolve manually.");
      } else {
        toast.error(data.message || "Не удалось синхронизировать ветку");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setIsSyncing(false);
    }
  }

  // NEW: Fetch notifications for this specific repository
  async function fetchRepoNotifications() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:5068/api/mergerequest/repo/${id}/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }

  // NEW: Mark notification as read
  async function markNotificationAsRead(notificationId: string) {
    const token = localStorage.getItem("token");

    try {
      await fetch(
        `http://localhost:5068/api/mergerequest/notifications/${notificationId}/read`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }

  async function fetchRepoRole() {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch(
      `http://localhost:5068/api/repository/${id}/openrepo`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) return;

    const repo = await res.json();

    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentUserId = payload.nameid || payload.sub;

    let userRole = null;

    if (repo.ownerId === currentUserId) {
      userRole = "Owner";
    } else {
      const collab = repo.collaborators.find(
        (c: any) => c.userId === currentUserId
      );
      if (collab) userRole = "Collaborator";
    }

    setRole(userRole);
  }

  async function fetchBranches() {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5068/api/repository/${id}/branches`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      toast.error("Не удалось загрузить ветки");
      return;
    }

    const data = await res.json();
    setBranches(data);
  }

  async function fetchFiles() {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:5068/api/files/${id}/files?branch=${branch}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      toast.error("Не удалось загрузить файлы");
      return;
    }

    const data = await response.json();
    setFiles(data);
  }

  async function handleCreateFile() {
    const token = localStorage.getItem("token");

    if (!fileName.trim()) {
      toast.error("Укажите имя файла");
      return;
    }

    const response = await fetch(
      `http://localhost:5068/api/files/${id}/createfile`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fileName }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message || "Не удалось создать файл");
      return;
    }

    toast.success("Файл успешно создан!");
    setFileName("");
    setShowCreate(false);

    navigate(`/repo/${id}/file/${data.fileId}`, {
      state: { branch },
    });
  }

  async function searchUsers() {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5068/api/repository/search-users?query=${search}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      setResults([]);
      return;
    }

    const data = await res.json();
    setResults(data);
  }

  async function addCollaborator() {
    if (!selectedUser) {
      toast.error("Сначала выберите пользователя");
      return;
    }

    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5068/api/repository/${id}/collaborators`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          collaboratorId: selectedUser.id,
          role: "Collaborator",
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message || "Не удалось добавить участника");
      return;
    }

    toast.success("Участник добавлен!");
    setSearch("");
    setSelectedUser(null);
    setResults([]);
  }

  const [showMRForm, setShowMRForm] = useState(false);
  const [mrTitle, setMrTitle] = useState("");
  const [mrDescription, setMrDescription] = useState("");

  async function submitMergeRequest() {
    if (!mrTitle.trim()) {
      toast.error("Введите название");
      return;
    }
    if (!mrDescription.trim()) {
      toast.error("Введите описание");
      return;
    }

    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5068/api/mergerequest/${id}/create-merge-request?branchName=${branch}&title=${encodeURIComponent(
        mrTitle
      )}&description=${encodeURIComponent(mrDescription)}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.message);
      return;
    }

    toast.success("Запрос на слияние создан!");
    setShowMRForm(false);
    setMrTitle("");
    setMrDescription("");
    fetchRepoNotifications(); // Refresh notifications after creating MR
  }

  async function createBranch() {
    const token = localStorage.getItem("token");

    if (!branchInput.trim()) {
      toast.error("Укажите название ветки");
      return;
    }

    const res = await fetch(
      `http://localhost:5068/api/repository/${id}/branches?branchName=${branchInput}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message);
      return;
    }

    toast.success("Ветка создана!");
    setBranch(data.branchName);
    fetchBranches();
    setBranchInput("");
  }

  if (!branch && !isOwner) {
    return (
      <div className={styles.branchBox}>
        <div className={styles.orb1}></div>
        <div className={styles.orb2}></div>
        <div className={styles.orb3}></div>
        <h2 className={styles.branchTitle}>Выберите или создайте ветку</h2>

        <div className={styles.branchControls}>
          <select
            className={styles.branchSelect}
            onChange={(e) => setBranch(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>
              Выберите ветку
            </option>

            {branches
              .filter((b) => isOwner || b !== "main")
              .map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
          </select>

          <div className={styles.divider}>или</div>

          <input
            className={styles.branchInput}
            placeholder="Название новой ветки..."
            value={branchInput}
            onChange={(e) => setBranchInput(e.target.value)}
          />

          <button className={styles.createBranchBtn} onClick={createBranch}>
            + Создать ветку
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.orb1}></div>
      <div className={styles.orb2}></div>
      <div className={styles.orb3}></div>
      
      {/* HEADER */}
      <div className={styles.header}>
        <h1 className={styles.title}>Репозиторий ({branch})</h1>

        <div>
          {isOwner && (
            <button
              className={`${styles.button} ${styles.secondaryButton}`}
              onClick={() => navigate(`/repo/${id}/merge-requests`)}
            >
              📥 Запросы на слияние
            </button>
          )}

          {!isOwner && branch !== "main" && (
            <button className={styles.button} onClick={() => setShowMRForm(true)}>
              📤 Создать запрос на слияние
            </button>
          )}
        </div>
      </div>
           {isBehind && !isOwner && (
        <div className={styles.warningBanner}>
          <div className={styles.warningIcon}>⚠️</div>
          <div className={styles.warningMessage}>
            Ваша ветка отстаёт от main на {commitsBehind} изменений.
            Рекомендуется синхронизироваться перед продолжением работы.
          </div>
          <button 
            className={styles.syncButton} 
            onClick={syncBranch}
            disabled={isSyncing}
          >
            {isSyncing ? "🔄 Синхронизация..." : "🔄 Синхронизировать"}
          </button>
        </div>
      )}
      {/* NOTIFICATIONS SECTION - Moved from Dashboard, now repo-specific */}
      {notifications.length > 0 && (
        <div className={styles.notificationsSection}>
          <div className={styles.notificationsHeader}>
            <span className={styles.bellIcon}>🔔</span>
            <h3>Уведомления по репозиторию</h3>
            <button 
              className={styles.toggleNotifications}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              {showNotifications ? "▲ Скрыть" : "▼ Показать"} ({notifications.length})
            </button>
          </div>
          
          {showNotifications && (
            <div className={styles.notificationsList}>
              {notifications.map((notif) => (
                <div key={notif.id} className={styles.notificationItem}>
                  <div className={styles.notificationIcon}>📄</div>
                  <div className={styles.notificationContent}>
                    <div className={styles.notificationMessage}>{notif.message}</div>
                    {notif.relatedBranchName && (
                      <div className={styles.notificationBranch}>
                        🌿 Ветка: {notif.relatedBranchName}
                      </div>
                    )}
                    <div className={styles.notificationDate}>
                      {new Date(notif.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <button 
                    className={styles.markReadButton}
                    onClick={() => markNotificationAsRead(notif.id)}
                    title="Отметить как прочитанное"
                  >
                    ✖
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!isOwner && branch === "main" && (
        <p className={styles.warning}>
          ⚠️ Вы не можете редактировать main. Создайте ветку.
        </p>
      )}

      {/* COLLABORATORS */}
      {isOwner && (
        <div className={styles.section}>
          <h3>Добавить участника</h3>

          <div className={styles.inputGroup}>
            <input
              className={styles.searchInput}
              placeholder="Поиск..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button className={styles.addButton} onClick={addCollaborator}>
              Добавить
            </button>
          </div>

          {results.length > 0 && (
            <div className={styles.searchResults}>
              {results.map((user) => (
                <div
                  key={user.id}
                  className={styles.searchItem}
                  onClick={() => {
                    setSelectedUser(user);
                    setSearch(user.email);
                    setResults([]);
                  }}
                >
                  {user.userName} — {user.email}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FILES */}
      <div className={styles.section}>
        {isOwner && (
          <div className={styles.createFileContainer}>
            <button
              className={styles.createFileButton}
              onClick={() => setShowCreate(true)}
            >
              + Создать файл
            </button>
          </div>
        )}

        <div className={styles.fileList}>
          <h2 className={styles.sectionTitle }>Файлы</h2> 
          {files.map((file) => {
            const disabled = !isOwner && branch === "main";

            return (
              <div
                key={file.id}
                className={`${styles.fileCard} ${
                  disabled ? styles.disabled : ""
                }`}
                onClick={() => {
                  if (disabled) {
                    toast.info("Нельзя редактировать main");
                    return;
                  }

                  navigate(`/repo/${id}/file/${file.id}`, {
                    state: { branch },
                  });
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div className={styles.fileName}>{file.fileName}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE FILE */}
      {showCreate && (
        <div className={styles.section}>
          <h3>Создать файл</h3>

          <input
            className={styles.input}
            placeholder="Имя файла"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />

          <button className={styles.button} onClick={handleCreateFile}>
            Создать
          </button>
        </div>
      )}

      {/* MERGE REQUEST MODAL */}
      {showMRForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Новый запрос на слияние</h3>
            </div>
            <div className={styles.modalSubtitle}>
              Предложите изменения в основной ветке
            </div>
            
            <input
              type="text"
              placeholder="Название запроса"
              value={mrTitle}
              onChange={(e) => setMrTitle(e.target.value)}
              className={styles.modalInput}
            />
            
            <textarea
              placeholder="Опишите ваши изменения..."
              value={mrDescription}
              onChange={(e) => setMrDescription(e.target.value)}
              className={styles.modalTextarea}
            />
            
            <div className={styles.modalButtons}>
              <button onClick={() => setShowMRForm(false)} className={styles.modalCancelBtn}>
                Отмена
              </button>
              <button onClick={submitMergeRequest} className={styles.modalSubmitBtn}>
                Создать запрос
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RepoPage;