import TaskForm from "./TaskForm";

const formatDate = (date) => {
  if (!date) {
    return "No due date";
  }

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function Dashboard({
  user,
  tasks,
  onLogout,
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
      <header className="topbar">
        <div>
          <span className="eyebrow">Task Manager</span>
          <h1>{user.name.split(" ")[0]}'s productivity board</h1>
          <p>Track everything in one place and keep momentum visible.</p>
        </div>
        <button className="ghost-btn" type="button" onClick={onLogout}>
          Logout
        </button>
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
                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => onToggleTask(task)}
                      />
                      <div>
                        <h4>{task.title}</h4>
                        <p>{task.description || "No description added yet."}</p>
                      </div>
                    </label>
                    <span className={`priority-chip ${task.priority}`}>{task.priority}</span>
                  </div>

                  <div className="task-meta">
                    <span>{formatDate(task.dueDate)}</span>
                    <span>{task.completed ? "Completed" : "In progress"}</span>
                  </div>

                  <div className="task-actions">
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

