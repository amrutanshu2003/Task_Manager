import TaskForm from "./TaskForm";

const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

const formatDate = (date) => {
  if (!date) {
    return "No due date";
  }

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCountdown = (deletedAt, now) => {
  const remainingMs = Math.max(new Date(deletedAt).getTime() + THIRTY_DAYS_IN_MS - now, 0);
  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
};

function Dashboard({
  user,
  tasks,
  deletedTasks,
  recycleNow,
  onLogout,
  onNavigateAccount,
  theme,
  onToggleTheme,
  onSaveTask,
  onDeleteTask,
  onRestoreTask,
  onPermanentDeleteTask,
  onEmptyRecycleBin,
  onEditTask,
  onToggleTask,
  selectedTask,
  onCancelEdit,
  loading,
}) {
  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = tasks.length - completedTasks;
  const highPriorityTasks = tasks.filter((task) => task.priority === "high" && !task.completed).length;

  return (
    <div className="dashboard-shell">
      <header className="navbar">
        <div className="nav-brand">
          <span className="brand-mark">TM</span>
          <div>
            <span className="eyebrow">Task Manager</span>
            <strong>{user.name.split(" ")[0]}'s workspace</strong>
          </div>
        </div>
        <nav className="nav-actions">
          <button
            className="icon-btn ghost-btn"
            type="button"
            onClick={onNavigateAccount}
            aria-label="Account settings"
            title="Account settings"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 12.25a3.25 3.25 0 1 0-3.25-3.25A3.25 3.25 0 0 0 12 12.25Zm0 1.5c-3.42 0-6.25 1.77-6.25 4a.75.75 0 0 0 1.5 0c0-1.12 1.92-2.5 4.75-2.5s4.75 1.38 4.75 2.5a.75.75 0 0 0 1.5 0c0-2.23-2.83-4-6.25-4Z" />
            </svg>
          </button>
          <button
            className={`icon-btn theme-toggle-btn ${theme === "dark" ? "dark-active" : "light-active"}`}
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span className="theme-orb" aria-hidden="true" />
            <svg className="theme-icon sun-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5.25a.75.75 0 0 1 .75.75v.35a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75Zm0 12.4a.75.75 0 0 1 .75.75v.35a.75.75 0 0 1-1.5 0v-.35a.75.75 0 0 1 .75-.75Zm6.4-6.4a.75.75 0 0 1 .75.75v.35a.75.75 0 0 1-1.5 0V12a.75.75 0 0 1 .75-.75Zm-12.8 0a.75.75 0 0 1 .75.75v.35a.75.75 0 0 1-1.5 0V12a.75.75 0 0 1 .75-.75Zm10.03-4.38a.75.75 0 0 1 1.06 0l.24.25a.75.75 0 1 1-1.06 1.06l-.24-.25a.75.75 0 0 1 0-1.06Zm-8.32 8.32a.75.75 0 0 1 1.06 0l.24.24a.75.75 0 1 1-1.06 1.06l-.24-.24a.75.75 0 0 1 0-1.06Zm9.38 1.3a.75.75 0 0 1-1.06 0l-.24-.24a.75.75 0 1 1 1.06-1.06l.24.24a.75.75 0 0 1 0 1.06Zm-8.32-8.32a.75.75 0 0 1-1.06 0l-.24-.25a.75.75 0 1 1 1.06-1.06l.24.25a.75.75 0 0 1 0 1.06Z" />
              <path d="M12 8.1A3.9 3.9 0 1 0 15.9 12 3.9 3.9 0 0 0 12 8.1Zm0 1.5A2.4 2.4 0 1 1 9.6 12 2.4 2.4 0 0 1 12 9.6Z" />
            </svg>
            <svg className="theme-icon moon-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 4.2c.42 1.56 1.64 2.78 3.2 3.2-1.56.42-2.78 1.64-3.2 3.2-.42-1.56-1.64-2.78-3.2-3.2 1.56-.42 2.78-1.64 3.2-3.2Zm5.1 7.3c.27.99 1.05 1.77 2.04 2.04-.99.27-1.77 1.05-2.04 2.04-.27-.99-1.05-1.77-2.04-2.04.99-.27 1.77-1.05 2.04-2.04Zm-7.4 3.45c.33 1.22 1.28 2.17 2.5 2.5-1.22.33-2.17 1.28-2.5 2.5-.33-1.22-1.28-2.17-2.5-2.5 1.22-.33 2.17-1.28 2.5-2.5Z" />
            </svg>
          </button>
          <button
            className="icon-btn ghost-btn"
            type="button"
            onClick={onLogout}
            aria-label="Logout"
            title="Logout"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M10.75 4.75a.75.75 0 0 1 0 1.5H7.5a.75.75 0 0 0-.75.75v10a.75.75 0 0 0 .75.75h3.25a.75.75 0 0 1 0 1.5H7.5A2.25 2.25 0 0 1 5.25 17V7A2.25 2.25 0 0 1 7.5 4.75h3.25Zm5.72 3.97a.75.75 0 0 1 1.06 0l2.75 2.75a.75.75 0 0 1 0 1.06l-2.75 2.75a.75.75 0 1 1-1.06-1.06L17.94 12l-1.47-1.47a.75.75 0 0 1 0-1.06ZM9 11.25h10a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1 0-1.5Z" />
            </svg>
          </button>
        </nav>
      </header>

      <header className="topbar">
        <div>
          <span className="eyebrow">Task overview</span>
          <h1>Stay on top of your day</h1>
          <p>Track everything in one place and keep momentum visible.</p>
        </div>
      </header>

      <section className="stats-grid">
        <article>
          <span>Total Tasks</span>
          <strong>{tasks.length}</strong>
        </article>
        <article>
          <span>Pending</span>
          <strong>{pendingTasks}</strong>
        </article>
        <article>
          <span>Completed</span>
          <strong>{completedTasks}</strong>
        </article>
        <article>
          <span>High Priority</span>
          <strong>{highPriorityTasks}</strong>
        </article>
        <article>
          <span>Recycle Bin</span>
          <strong>{deletedTasks.length}</strong>
        </article>
      </section>

      <section className="dashboard-grid">
        <TaskForm
          onSave={onSaveTask}
          selectedTask={selectedTask}
          onCancel={onCancelEdit}
          loading={loading}
        />

        <div className="tasks-panel">
          <div className="section-heading">
            <div>
              <span className="pill">Your tasks</span>
              <h3>Focus list</h3>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="empty-state">
              <h4>No tasks yet</h4>
              <p>Create your first task to start building momentum.</p>
            </div>
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <article className={`task-card ${task.completed ? "done" : ""}`} key={task._id}>
                  <div className="task-card-top">
                    <div className="task-copy">
                      <h4>{task.title}</h4>
                      <p>{task.description || "No description added yet."}</p>
                    </div>
                    <span className={`priority-chip ${task.priority}`}>{task.priority}</span>
                  </div>

                  <div className="task-meta">
                    <span>{formatDate(task.dueDate)}</span>
                    <span>{task.completed ? "Completed" : "In progress"}</span>
                  </div>

                  <div className="task-actions">
                    {!task.completed && (
                      <button className="success-btn" type="button" onClick={() => onToggleTask(task)}>
                        Complete
                      </button>
                    )}
                    {!task.completed && (
                      <button className="ghost-btn" type="button" onClick={() => onEditTask(task)}>
                        Edit
                      </button>
                    )}
                    {task.completed && (
                      <button className="danger-btn" type="button" onClick={() => onDeleteTask(task._id)}>
                        Delete
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bin-panel">
        <div className="section-heading">
          <div>
            <span className="pill">Recycle bin</span>
            <h3>Deleted tasks stay here for 30 days</h3>
          </div>
          {deletedTasks.length > 0 && (
            <button className="danger-btn" type="button" onClick={onEmptyRecycleBin}>
              Empty Recycle Bin
            </button>
          )}
        </div>

        {deletedTasks.length === 0 ? (
          <div className="empty-state recycle-empty">
            <h4>Recycle bin is empty</h4>
            <p>Deleted tasks will appear here until they are removed automatically.</p>
          </div>
        ) : (
          <div className="recycle-list">
            {deletedTasks.map((task) => (
              <article className="recycle-card" key={task._id}>
                <div className="recycle-copy">
                  <h4>{task.title}</h4>
                  <p>{task.description || "No description added."}</p>
                </div>
                <div className="recycle-meta">
                  <span>Deleted on {formatDate(task.deletedAt)}</span>
                  <strong>{formatCountdown(task.deletedAt, recycleNow)}</strong>
                </div>
                <div className="task-actions">
                  <button className="ghost-btn" type="button" onClick={() => onRestoreTask(task._id)}>
                    Restore
                  </button>
                  <button
                    className="icon-btn danger-icon-btn"
                    type="button"
                    onClick={() => onPermanentDeleteTask(task._id)}
                    aria-label="Delete permanently"
                    title="Delete permanently"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M9.25 3.75A1.25 1.25 0 0 1 10.5 2.5h3A1.25 1.25 0 0 1 14.75 3.75V4h3a.75.75 0 0 1 0 1.5h-.56l-.62 11.16A2.25 2.25 0 0 1 14.32 18.8H9.68a2.25 2.25 0 0 1-2.25-2.14L6.81 5.5h-.56a.75.75 0 0 1 0-1.5h3v-.25Zm1.25.25h3v-.25a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25V4Zm-1.56 1.5.6 10.97a.75.75 0 0 0 .75.71h4.64a.75.75 0 0 0 .75-.71l.6-10.97H8.94Zm2.31 2.25a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0V8.5a.75.75 0 0 1 .75-.75Zm3.5 0a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0V8.5a.75.75 0 0 1 .75-.75Z" />
                    </svg>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
