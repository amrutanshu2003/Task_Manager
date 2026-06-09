import { useEffect, useState } from "react";
import api, { setAuthToken } from "./api";
import AccountPage from "./components/AccountPage";
import AuthForm from "./components/AuthForm";
import Dashboard from "./components/Dashboard";

const TOKEN_KEY = "task-manager-token";
const USER_KEY = "task-manager-user";
const THEME_KEY = "task-manager-theme";

const getCurrentPath = () => window.location.pathname || "/";

function App() {
  const [mode, setMode] = useState("login");
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [theme, setTheme] = useState(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser?.themePreference) {
        return parsedUser.themePreference;
      }
    }

    return localStorage.getItem(THEME_KEY) || "dark";
  });
  const [tasks, setTasks] = useState([]);
  const [deletedTasks, setDeletedTasks] = useState([]);
  const [recycleNow, setRecycleNow] = useState(Date.now());
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentPath, setCurrentPath] = useState(getCurrentPath);
  const [authError, setAuthError] = useState("");
  const [taskError, setTaskError] = useState("");
  const [accountMessage, setAccountMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [taskLoading, setTaskLoading] = useState(false);
  const [accountLoading, setAccountLoading] = useState(false);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRecycleNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(getCurrentPath());
    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (!token) {
      setTasks([]);
      setDeletedTasks([]);
      return;
    }

    const fetchTasks = async () => {
      try {
        const [tasksResponse, deletedTasksResponse, profileResponse] = await Promise.all([
          api.get("/tasks"),
          api.get("/tasks/deleted"),
          api.get("/auth/me"),
        ]);
        setTasks(tasksResponse.data);
        setDeletedTasks(deletedTasksResponse.data);
        persistSession(token, profileResponse.data);
      } catch (error) {
        handleLogout();
      }
    };

    fetchTasks();
  }, [token]);

  const persistSession = (nextToken, nextUser) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
    setTheme(nextUser.themePreference || "dark");
  };

  const navigateTo = (path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
      setCurrentPath(path);
    }
  };

  const handleAuth = async (formData) => {
    setAuthLoading(true);
    setAuthError("");

    try {
      const endpoint = mode === "signup" ? "/auth/signup" : "/auth/login";
      const payload =
        mode === "signup"
          ? formData
          : { email: formData.email, password: formData.password };

      const { data } = await api.post(endpoint, payload);
      persistSession(data.token, data.user);
    } catch (error) {
      setAuthError(error.response?.data?.message || "Something went wrong");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAuthToken("");
    setToken("");
    setUser(null);
    setTasks([]);
    setDeletedTasks([]);
    setSelectedTask(null);
    setTaskError("");
    setAccountMessage("");
    navigateTo("/");
  };

  const handleToggleTheme = async () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);

    if (!token || !user) {
      return;
    }

    try {
      const { data } = await api.put("/auth/preferences/theme", {
        themePreference: nextTheme,
      });
      persistSession(token, data);
    } catch (error) {
      setTheme(user.themePreference || "dark");
      setTaskError(error.response?.data?.message || "Could not update theme");
    }
  };

  const handleSaveTask = async (formData) => {
    setTaskLoading(true);
    setTaskError("");
    setAccountMessage("");

    try {
      if (selectedTask) {
        const { data } = await api.put(`/tasks/${selectedTask._id}`, formData);
        setTasks((current) =>
          current.map((task) => (task._id === data._id ? data : task))
        );
        setSelectedTask(null);
      } else {
        const { data } = await api.post("/tasks", formData);
        setTasks((current) => [data, ...current]);
      }
    } catch (error) {
      setTaskError(error.response?.data?.message || "Could not save task");
    } finally {
      setTaskLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      setAccountMessage("");
      const taskToDelete = tasks.find((task) => task._id === taskId);
      if (taskToDelete && !taskToDelete.completed) {
        setTaskError("Complete the task before deleting it");
        return;
      }

      const { data } = await api.delete(`/tasks/${taskId}`);
      setTasks((current) => current.filter((task) => task._id !== taskId));
      if (data.task) {
        setDeletedTasks((current) => [data.task, ...current]);
      }
      if (selectedTask?._id === taskId) {
        setSelectedTask(null);
      }
    } catch (error) {
      setTaskError(error.response?.data?.message || "Could not delete task");
    }
  };

  const handleToggleTask = async (task) => {
    try {
      setAccountMessage("");
      const { data } = await api.put(`/tasks/${task._id}`, {
        completed: true,
      });
      setTasks((current) =>
        current.map((item) => (item._id === data._id ? data : item))
      );
      if (selectedTask?._id === task._id) {
        setSelectedTask(null);
      }
    } catch (error) {
      setTaskError(error.response?.data?.message || "Could not update task");
    }
  };

  const handleEditTask = (task) => {
    setAccountMessage("");
    if (task.completed) {
      setTaskError("Completed tasks can no longer be edited");
      return;
    }
    setSelectedTask(task);
  };

  const handleRestoreTask = async (taskId) => {
    try {
      setAccountMessage("");
      const { data } = await api.put(`/tasks/${taskId}/restore`);
      setDeletedTasks((current) => current.filter((task) => task._id !== taskId));
      setTasks((current) => [data, ...current]);
    } catch (error) {
      setTaskError(error.response?.data?.message || "Could not restore task");
    }
  };

  const handlePermanentDeleteTask = async (taskId) => {
    try {
      setAccountMessage("");
      await api.delete(`/tasks/${taskId}/permanent`);
      setDeletedTasks((current) => current.filter((task) => task._id !== taskId));
    } catch (error) {
      setTaskError(error.response?.data?.message || "Could not permanently delete task");
    }
  };

  const handleEmptyRecycleBin = async () => {
    try {
      setAccountMessage("");
      await api.delete("/tasks/deleted");
      setDeletedTasks([]);
    } catch (error) {
      setTaskError(error.response?.data?.message || "Could not empty recycle bin");
    }
  };

  const handleUpdateProfile = async (formData) => {
    setAccountLoading(true);
    setTaskError("");
    setAccountMessage("");

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const { data } = await api.put("/auth/me", payload);
      persistSession(token, data);
      setAccountMessage("Profile updated successfully");
      return true;
    } catch (error) {
      setTaskError(error.response?.data?.message || "Could not update profile");
      return false;
    } finally {
      setAccountLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setAccountLoading(true);
    setTaskError("");
    setAccountMessage("");

    try {
      const { data } = await api.delete("/auth/me");
      persistSession(token, data.user);
      setAccountMessage(data.message);
    } catch (error) {
      setTaskError(error.response?.data?.message || "Could not delete account");
    } finally {
      setAccountLoading(false);
    }
  };

  const handleCancelDeleteAccount = async () => {
    setAccountLoading(true);
    setTaskError("");
    setAccountMessage("");

    try {
      const { data } = await api.delete("/auth/me/delete-request");
      persistSession(token, data.user);
      setAccountMessage(data.message);
    } catch (error) {
      setTaskError(error.response?.data?.message || "Could not cancel account deletion");
    } finally {
      setAccountLoading(false);
    }
  };

  if (!user || !token) {
    return (
      <main className="app-shell">
        <AuthForm
          mode={mode}
          onSubmit={handleAuth}
          loading={authLoading}
          error={authError}
          onSwitchMode={() => {
            setAuthError("");
            setMode((current) => (current === "signup" ? "login" : "signup"));
          }}
        />
      </main>
    );
  }

  if (currentPath === "/account") {
    return (
      <main className="app-shell">
        <AccountPage
          user={user}
          theme={theme}
          now={recycleNow}
          onToggleTheme={handleToggleTheme}
          onNavigateDashboard={() => navigateTo("/")}
          onUpdateProfile={handleUpdateProfile}
          onCancelDeleteAccount={handleCancelDeleteAccount}
          onDeleteAccount={handleDeleteAccount}
          loading={accountLoading}
          message={accountMessage}
          error={taskError}
        />
      </main>
    );
  }

  return (
    <main className="app-shell">
      {taskError && <p className="floating-error">{taskError}</p>}
      <Dashboard
        user={user}
        tasks={tasks}
        deletedTasks={deletedTasks}
        recycleNow={recycleNow}
        onLogout={handleLogout}
        onNavigateAccount={() => navigateTo("/account")}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onSaveTask={handleSaveTask}
        onDeleteTask={handleDeleteTask}
        onRestoreTask={handleRestoreTask}
        onPermanentDeleteTask={handlePermanentDeleteTask}
        onEmptyRecycleBin={handleEmptyRecycleBin}
        onEditTask={handleEditTask}
        onToggleTask={handleToggleTask}
        selectedTask={selectedTask}
        onCancelEdit={() => setSelectedTask(null)}
        loading={taskLoading}
      />
    </main>
  );
}

export default App;
