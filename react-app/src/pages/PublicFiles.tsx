import styles from "./PublicFiles.module.css";
import { useEffect, useState } from "react";

function PublicFiles() {
  const [files, setFiles] = useState<any[]>([]);
  const hasFiles = files.length > 0;
  const [selectedFile, setSelectedFile] = useState<any>(null);

  useEffect(() => {
    fetchPublicFiles();
  }, []);

  async function fetchPublicFiles() {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5068/api/files/public", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return;

    const data = await res.json();
    setFiles(data);
  }

  async function fetchFile(fileId: string) {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `http://localhost:5068/api/files/public/${fileId}`,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) return;

    const data = await res.json();
    console.log(data);
    setSelectedFile(data);
  }

  return (
    <div className={styles.container}>
      <div className={styles.orb1}></div>
    <div className={styles.orb2}></div>
    <div className={styles.orb3}></div>
      {hasFiles ? (
        <>
          <div className={styles.header}>
            <h1 className={styles.title}>Публичные документы</h1>
            <p className={styles.subtitle}>
              Изучайте файлы, опубликованные другими пользователями
            </p>
          </div>

          <div className={styles.filesGrid}>
            {files.map((file) => (
              <div key={file.id} className={styles.card}>
                <h3 className={styles.fileName}>{file.fileName}</h3>

                <p className={styles.meta}>
                  {file.publicSummary || "Нет описания"} •{" "}
                  {file.publishedAt
                    ? new Date(file.publishedAt).toLocaleString()
                    : ""}
                </p>

                <button
                  className={styles.viewButton}
                  onClick={() => fetchFile(file.id)}
                >
                  Просмотр
                </button>

              </div>
            ))}
            {selectedFile && (
              <div className={styles.viewerOverlay}>
                <div className={styles.viewerCard}>
                  
                  <div className={styles.viewerHeader}>
                    <h2>{selectedFile.fileName}</h2>
                    <button className={styles.closeButton} onClick={() => setSelectedFile(null)}>
                      Закрыть
                    </button>
                  </div>

                  <p className={styles.viewerMeta}>
                    {selectedFile.publicSummary}
                  </p>

                  <div className={styles.viewerContent}>{selectedFile.content}</div>

                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>✨</div>
          <h2>Пока нет публичных файлов</h2>
          <p>Когда пользователи поделятся файлами, они появятся здесь</p>
        </div>
      )}

    </div>
  );
}

export default PublicFiles;