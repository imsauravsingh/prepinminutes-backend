# Hermes Task Automation & Kanban Board — PrepInMinutes

This directory manages the master execution plan, task pipeline, and autonomous development workflow for **PrepInMinutes** using the Hermes Agent framework.

---

## 🗂️ Directory Structure

- `kanban-board.md`: Master Markdown view of the 8 architectural phases and 28 tasks.
- `tasks.json`: Structured JSON definitions of all tasks, dependencies, deliverables, and clearance criteria.
- `stepwise-feature-plan.md`: In-depth engineering specifications, mathematical formulas, and service contracts.
- `populate-kanban.sh`: Executable automation script to populate all 28 tasks directly into the Hermes SQLite Kanban database (`~/.hermes/kanban.db`).
- `runner-guide.md`: Operational guide for starting the Hermes dashboard, dispatching tasks, and monitoring agents.

---

## 🚀 Quick Start

1. **Populate Tasks into Hermes Board**:
   ```bash
   ./hermes/populate-kanban.sh prepinminutes
   ```

2. **Launch the Hermes Dashboard**:
   ```bash
   hermes dashboard --host 0.0.0.0 --port 9119
   ```

3. **View the Board**:
   Open `http://127.0.0.1:9119` or your configured domain (`hermes.prepinminutes.com`) and select the **prepinminutes** board from the Kanban tab.
