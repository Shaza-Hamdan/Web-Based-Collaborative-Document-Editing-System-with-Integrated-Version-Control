import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./MergeRequestPage.module.css";
import { GitCompare } from "lucide-react";
import { Inbox } from "lucide-react";

function MergeRequestsPage() {
  const { id } = useParams();
  const [requests, setRequests] = useState<any[]>([]);
  const [diffs, setDiffs] = useState<any[]>([]);
  const [showDiffViewer, setShowDiffViewer] = useState(false);
  const [showManualMerge, setShowManualMerge] = useState(false);
  const [showConflict, setShowConflict] = useState(false);
  const [conflictData, setConflictData] = useState<any>(null);
  const [manualContent, setManualContent] = useState("");
  
  useEffect(() => {
    fetchRequests();
  }, [id]);

  //--- Fetch Merge Requests ---//
  async function fetchRequests() {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5068/api/mergerequest/${id}/get-merge-requests`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const data = await res.json();
    setRequests(data ?? []);
  }

  //---- handleReject ----//
  async function handleReject(mergeRequestId: string) {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5068/api/mergerequest/${id}/merge-request/${mergeRequestId}/reject`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.message || "Не удалось отклонить запрос на слияние");
      return;
    }

    toast.success("Запрос на слияние отклонён");

    fetchRequests(); // refresh list
  }

  //---- Show differences ----//
  async function handleViewDiff(mergeRequestId: string) {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `http://localhost:5068/api/mergerequest/${id}/merge-request/${mergeRequestId}/diff`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      toast.error("Не удалось загрузить различия");
      return;
    }
    const data = await res.json();
    console.log("DIFF API RESPONSE:", data);
    setDiffs(data.diff ?? []);
    setShowDiffViewer(true);
  }

  //---- Merge Requests ----//
  async function handleMerge(mergeRequestId: string) {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5068/api/mergerequest/${id}/merge-request/${mergeRequestId}/merge`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (res.status === 409) {
      setConflictData(data);   // store backend conflict info
      setShowConflict(true);   // open modal / panel
      return;
    }

    if (!res.ok) {
      toast.error(data.message || "Не удалось выполнить слияние");
      return;
    }

    if (data.Result === "UpToDate") {
      toast.info("Всё актуально");
    }
    else if (data.Result === "Success") {
      toast.success("Слияние выполнено успешно");
    }
    else {
      toast.success("Слияние завершено");
    }

    await fetchRequests();
    setShowDiffViewer(false);
  }

  async function resolveConflict(choice: "current" | "incoming" | "manual", manualValue?: string) {
    const token = localStorage.getItem("token");

    const resolvedContent =
      choice === "current"
        ? conflictData.current
        : choice === "incoming"
        ? conflictData.incoming
        : manualValue;

    console.log("conflictData:", conflictData);
    console.log("fileId:", conflictData.fileId);
    console.log("resolvedContent:", resolvedContent);
    console.log("Repository ID:", id);
    
    const res = await fetch(
      `http://localhost:5068/api/MergeRequest/${id}/resolve-conflict`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId: conflictData.fileId,
          resolvedContent: resolvedContent,
          mergeRequestId: conflictData.id,
        }),
      }
    );
    
    console.log("Response status:", res.status);
    if (!res.ok) {
      const error = await res.json();
      toast.error(error.message || "Не удалось разрешить конфликт");
      return;
    }

    toast.success("Конфликт разрешён");
    setShowConflict(false);
    setShowManualMerge(false);
    setConflictData(null);
    setManualContent("");
    await fetchRequests();
  }

  return (
      <div className={styles.container}>
    <div className={styles.orb1}></div>
    <div className={styles.orb2}></div>
    <div className={styles.orb3}></div>

      {requests.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Inbox size={28} />
          </div>

          <h2 className={styles.emptyTitle}>
            Нет запросов на слияние
          </h2>

          <p className={styles.emptySubtitle}>
            Всё чисто ✨
          </p>
        </div>
      ) : (
        (requests ?? []).map((mr) => (
          <div key={mr.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>{mr.title}</h3>
              <span className={styles.badge}>{mr.status === "Pending" ? "Ожидает" : mr.status}</span>
            </div>

            <p className={styles.description}>{mr.description}</p>

            <div className={styles.meta}>
              <span>🌿 {mr.branchName}</span>
              <span>👤 {mr.createdBy}</span>
            </div>

            <div className={styles.actions}>
              <button
                className={styles.secondaryButton}
                onClick={() => handleViewDiff(mr.id)}
              >
                <GitCompare size={16} /> Различия
              </button>

              <button
                className={styles.mergeButton}
                onClick={() => handleMerge(mr.id)}
                disabled={mr.status !== "Pending"}
              >
                Слить
              </button>

              <button
                className={styles.rejectButton}
                onClick={() => handleReject(mr.id)}
              >
                Отклонить
              </button>
            </div>
          </div>
        ))
      )}

      {/* ===== DIFF VIEWER ===== */}
      {showDiffViewer && (
        <div className={styles.diffViewer}>
          <h3>Различия</h3>

          {diffs.length === 0 ? (
            <p>Различий не найдено</p>
          ) : (
            diffs.map((c, i) => (
              <div key={i} className={styles.diffItem}>
                <h4>Название документа: {c.filePath}</h4>

                <div className={styles.diffGrid}>
                  <div>
                    <div className={styles.diffLabel}>Основная ветка (main)</div>
                    <pre className={styles.oldCode}>{c.mainContent}</pre>
                  </div>

                  <div>
                    <div className={styles.diffLabel}>Ветка участника</div>
                    <pre className={styles.newCode}>{c.branchContent}</pre>
                  </div>
                </div>
              </div>
            ))
          )}

          <button
            className={styles.secondaryButton}
            onClick={() => setShowDiffViewer(false)}
          >
            Закрыть
          </button>
        </div>
      )}
      
      {/* ===== MANUAL MERGE ===== */}
      {showManualMerge && conflictData && (
        <div className={styles.manualContainer}>
          <h3 className={styles.manualTitle}>Ручное разрешение</h3>

          <div className={styles.manualGrid}>
            <div className={styles.panel}>
              <div className={styles.label}>Текущая версия</div>
              <pre className={styles.currentBox}>{conflictData.current}</pre>
            </div>

            <div className={styles.panel}>
              <div className={styles.label}>Входящая версия</div>
              <pre className={styles.incomingBox}>{conflictData.incoming}</pre>
            </div>
          </div>

          <div className={styles.editorSection}>
            <div className={styles.label}>Результат слияния</div>

            <textarea
              className={styles.manualEditor}
              value={manualContent}
              onChange={(e) => setManualContent(e.target.value)}
              placeholder="Отредактируйте финальную объединённую версию..."
            />
          </div>

          <div className={styles.manualActions}>
            <button
              className={styles.mergePrimaryBtn}
              onClick={() => resolveConflict("manual", manualContent)}
            >
              Подтвердить слияние
            </button>

            <button
              className={styles.secondaryButton}
              onClick={() => setShowManualMerge(false)}
            >
              Отмена
            </button>
          </div>
        </div>
      )}
      
      {/* ===== CONFLICT MODAL ===== */}
      {showConflict && conflictData && (
        <div className={styles.overlay}>
          <div className={styles.conflict}>
            <div className={styles.conflictHeader}>
              ⚠ Конфликт слияния
            </div>
            <p className={styles.conflictSubtext}>
              Выберите способ разрешения конфликта
            </p>
            <div className={styles.diffGrid}>
              <div className={styles.conflictVersion}>
                <div className={styles.diffLabel}>Ваша версия</div>
                <pre className={styles.oldCode}>{conflictData.current}</pre>
              </div>

              <div className={styles.conflictVersion}>
                <div className={styles.diffLabel}>Версия участника</div>
                <pre className={styles.newCode}>{conflictData.incoming}</pre>
              </div>
            </div>

            <div className={styles.conflictActions}>
              <button
                className={`${styles.btnResolve} ${styles.btnKeep}`}
                onClick={() => resolveConflict("current")}
              >
                Оставить мою версию
              </button>

              <button
                className={`${styles.btnResolve} ${styles.btnIncoming}`}
                onClick={() => resolveConflict("incoming")}
              >
                Использовать версию участника
              </button>

              <button
                className={`${styles.btnResolve} ${styles.btnManual}`}
                onClick={() => {
                  setShowManualMerge(true);
                  setShowConflict(false);
                  setManualContent("");
                }}
              >
                Ручное слияние
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MergeRequestsPage;