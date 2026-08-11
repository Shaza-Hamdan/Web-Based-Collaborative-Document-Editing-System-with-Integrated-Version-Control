import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import CreateRepo from "./pages/createRepo";
import RepoPage from "./pages/repopage";
import FilePage from "./pages/FilePage";
import MergeRequestsPage from "./pages/MergeRequestsPage";
import PublicFiles from "./pages/PublicFiles";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/create-repo" element={<CreateRepo />} />
      <Route path="/repo/:id" element={<RepoPage />} />
      <Route path="/repo/:repoId/file/:fileId" element={<FilePage />} />
      <Route path="/repo/:id/merge-requests" element={<MergeRequestsPage />}/>
      <Route path="/PublicFiles" element={<PublicFiles />} />
      
    </Routes>

    <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;