import TaskForm from "./TaskForm";

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

function Dashboard({
  user,
  tasks,
  onLogout,
  theme,
  onToggleTheme,
  onSaveTask,
  onDeleteTask,
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
            className="icon-btn"
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 4.75a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V5.5a.75.75 0 0 1 .75-.75Zm0 11.5a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5Zm7.25-5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1 0-1.5h1.5ZM6.25 12a.75.75 0 0 1-.75.75H4a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 .75.75Zm10.18-5.68a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 1 1-1.06 1.06l-1.06-1.06a.75.75 0 0 1 0-1.06Zm-9.92 9.92a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 1 1-1.06 1.06l-1.06-1.06a.75.75 0 0 1 0-1.06Zm11.04 1.06a.75.75 0 0 1-1.06 0l-1.06-1.06a.75.75 0 0 1 1.06-1.06l1.06 1.06a.75.75 0 0 1 0 1.06ZM8.63 8.63a.75.75 0 0 1-1.06 0L6.51 7.57a.75.75 0 1 1 1.06-1.06l1.06 1.06a.75.75 0 0 1 0 1.06ZM12 17a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 12 17Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14.82 2.41a.75.75 0 0 1 .2 1.03A8.25 8.25 0 1 0 20.56 9a.75.75 0 0 1 1.24.8A9.75 9.75 0 1 1 14.62 2.6a.75.75 0 0 1 .2-.19Z" />
              </svg>
            )}
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
                    <button className="ghost-btn" type="button" onClick={() => onEditTask(task)}>
                      Edit
                    </button>
                    <button className="danger-btn" type="button" onClick={() => onDeleteTask(task._id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
