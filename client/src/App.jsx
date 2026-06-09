import { useEffect, useState } from "react";
import api, { setAuthToken } from "./api";
import AuthForm from "./components/AuthForm";
import Dashboard from "./components/Dashboard";

const TOKEN_KEY = "task-manager-token";
const USER_KEY = "task-manager-user";

function App() {
  const [mode, setMode] = useState("login");
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [authError, setAuthError] = useState("");
  const [taskError, setTaskError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [taskLoading, setTaskLoading] = useState(false);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  useEffect(() => {
    if (!token) {
      setTasks([]);
      return;
    }

    const fetchTasks = async () => {
      try {
        const { data } = await api.get("/tasks");
        setTasks(data);
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
    setSelectedTask(null);
    setTaskError("");
  };

  const handleSaveTask = async (formData) => {
    setTaskLoading(true);
    setTaskError("");

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
      await api.delete(`/tasks/${taskId}`);
      setTasks((current) => current.filter((task) => task._id !== taskId));
      if (selectedTask?._id === taskId) {
        setSelectedTask(null);
      }
    } catch (error) {
      setTaskError(error.response?.data?.message || "Could not delete task");
    }
  };

  const handleToggleTask = async (task) => {
    try {
      const { data } = await api.put(`/tasks/${task._id}`, {
        completed: !task.completed,
      });
      setTasks((current) =>
        current.map((item) => (item._id === data._id ? data : item))
      );
    } catch (error) {
      setTaskError(error.response?.data?.message || "Could not update task");
    }
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
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

  return (
    <main className="app-shell">
      {taskError && <p className="floating-error">{taskError}</p>}
      <Dashboard
        user={user}
        tasks={tasks}
        onLogout={handleLogout}
        onSaveTask={handleSaveTask}
        onDeleteTask={handleDeleteTask}
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

