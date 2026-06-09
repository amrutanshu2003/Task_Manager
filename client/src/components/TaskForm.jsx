import { useEffect, useState } from "react";

const emptyTask = {
  title: "",
  description: "",
  dueDate: "",
  priority: "medium",
};

function TaskForm({ onSave, selectedTask, onCancel, loading }) {
  const [formData, setFormData] = useState(emptyTask);

  useEffect(() => {
    if (selectedTask) {
      setFormData({
        title: selectedTask.title,
        description: selectedTask.description || "",
        dueDate: selectedTask.dueDate ? selectedTask.dueDate.slice(0, 16) : "",
        priority: selectedTask.priority || "medium",
      });
      return;
    }

    setFormData(emptyTask);
  }, [selectedTask]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSave(formData);

    if (!selectedTask) {
      setFormData(emptyTask);
    }
  };

  return (
    <form className="task-form-card" onSubmit={handleSubmit}>
      <div className="section-heading">
        <div>
          <span className="pill">{selectedTask ? "Edit task" : "New task"}</span>
          <h3>{selectedTask ? "Update your task" : "Add something important"}</h3>
        </div>
      </div>

      <label>
        <span>Task title</span>
        <input
          name="title"
          type="text"
          placeholder="Prepare sprint notes"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        <span>Description</span>
        <textarea
          name="description"
          rows="4"
          placeholder="Capture details, blockers, or next steps..."
          value={formData.description}
          onChange={handleChange}
        />
      </label>

      <div className="task-form-grid">
        <label>
          <span>Due date and time</span>
          <input
            name="dueDate"
            type="datetime-local"
            value={formData.dueDate}
            onChange={handleChange}
          />
        </label>

        <label>
          <span>Priority</span>
          <select name="priority" value={formData.priority} onChange={handleChange}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
      </div>

      <div className="task-form-actions">
        <button className="primary-btn" type="submit" disabled={loading}>
          {loading ? "Saving..." : selectedTask ? "Update task" : "Create task"}
        </button>
        {selectedTask && (
          <button className="ghost-btn" type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default TaskForm;
