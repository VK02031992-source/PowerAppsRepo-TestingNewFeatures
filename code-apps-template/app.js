// Data Management Class
class DataManager {
    constructor() {
        this.storageKey = 'codeAppsData';
        this.data = this.loadData();
        this.editingId = null;
        this.searchTerm = '';
    }

    // Load data from localStorage
    loadData() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            return JSON.parse(stored);
        }
        // Initialize with sample data
        return [
            { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'Developer', status: 'Active' },
            { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Manager', status: 'Active' },
            { id: 3, name: 'Bob Johnson', email: 'bob.johnson@example.com', role: 'Designer', status: 'Inactive' }
        ];
    }

    // Save data to localStorage
    saveData() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    // Get next ID
    getNextId() {
        if (this.data.length === 0) return 1;
        return Math.max(...this.data.map(item => item.id)) + 1;
    }

    // Create - Add new record
    create(record) {
        const newRecord = {
            id: this.getNextId(),
            ...record
        };
        this.data.push(newRecord);
        this.saveData();
        return newRecord;
    }

    // Read - Get all records or filtered records
    read(filter = null) {
        if (filter) {
            return this.data.filter(filter);
        }
        return [...this.data];
    }

    // Update - Modify existing record
    update(id, updates) {
        const index = this.data.findIndex(item => item.id === id);
        if (index !== -1) {
            this.data[index] = { ...this.data[index], ...updates };
            this.saveData();
            return this.data[index];
        }
        return null;
    }

    // Delete - Remove record
    delete(id) {
        const index = this.data.findIndex(item => item.id === id);
        if (index !== -1) {
            this.data.splice(index, 1);
            this.saveData();
            return true;
        }
        return false;
    }

    // Delete multiple records
    deleteMultiple(ids) {
        this.data = this.data.filter(item => !ids.includes(item.id));
        this.saveData();
    }

    // Search records
    search(term) {
        if (!term) return this.data;
        const lowerTerm = term.toLowerCase();
        return this.data.filter(item =>
            item.name.toLowerCase().includes(lowerTerm) ||
            item.email.toLowerCase().includes(lowerTerm) ||
            item.role.toLowerCase().includes(lowerTerm) ||
            item.status.toLowerCase().includes(lowerTerm)
        );
    }
}

// UI Controller
class UIController {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.initializeElements();
        this.attachEventListeners();
        this.render();
    }

    initializeElements() {
        // Form elements
        this.form = document.getElementById('addForm');
        this.nameInput = document.getElementById('name');
        this.emailInput = document.getElementById('email');
        this.roleInput = document.getElementById('role');
        this.statusInput = document.getElementById('status');
        this.submitBtn = this.form.querySelector('button[type="submit"]');
        this.cancelBtn = document.getElementById('cancelEdit');

        // Grid elements
        this.gridBody = document.getElementById('gridBody');
        this.selectAllCheckbox = document.getElementById('selectAll');
        this.deleteSelectedBtn = document.getElementById('deleteSelected');
        this.recordCount = document.getElementById('recordCount');
        this.noData = document.getElementById('noData');

        // Search elements
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.clearSearchBtn = document.getElementById('clearSearch');
    }

    attachEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Cancel edit
        this.cancelBtn.addEventListener('click', () => {
            this.resetForm();
        });

        // Select all checkbox
        this.selectAllCheckbox.addEventListener('change', (e) => {
            this.handleSelectAll(e.target.checked);
        });

        // Delete selected
        this.deleteSelectedBtn.addEventListener('click', () => {
            this.handleDeleteSelected();
        });

        // Search
        this.searchBtn.addEventListener('click', () => {
            this.handleSearch();
        });

        this.searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        // Clear search
        this.clearSearchBtn.addEventListener('click', () => {
            this.searchInput.value = '';
            this.dataManager.searchTerm = '';
            this.render();
        });
    }

    handleFormSubmit() {
        const formData = {
            name: this.nameInput.value.trim(),
            email: this.emailInput.value.trim(),
            role: this.roleInput.value.trim(),
            status: this.statusInput.value
        };

        if (this.dataManager.editingId) {
            // Update existing record
            this.dataManager.update(this.dataManager.editingId, formData);
            this.showNotification('Record updated successfully!', 'success');
        } else {
            // Create new record
            this.dataManager.create(formData);
            this.showNotification('Record added successfully!', 'success');
        }

        this.resetForm();
        this.render();
    }

    handleEdit(id) {
        const record = this.dataManager.read().find(item => item.id === id);
        if (record) {
            this.nameInput.value = record.name;
            this.emailInput.value = record.email;
            this.roleInput.value = record.role;
            this.statusInput.value = record.status;

            this.dataManager.editingId = id;
            this.submitBtn.textContent = 'Update Record';
            this.submitBtn.classList.remove('btn-primary');
            this.submitBtn.classList.add('btn-warning');
            this.cancelBtn.style.display = 'inline-block';

            // Scroll to form
            this.form.scrollIntoView({ behavior: 'smooth' });
        }
    }

    handleDelete(id) {
        if (confirm('Are you sure you want to delete this record?')) {
            this.dataManager.delete(id);
            this.showNotification('Record deleted successfully!', 'success');
            this.render();
        }
    }

    handleSelectAll(checked) {
        const checkboxes = this.gridBody.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
            const row = checkbox.closest('tr');
            if (checked) {
                row.classList.add('selected');
            } else {
                row.classList.remove('selected');
            }
        });
    }

    handleDeleteSelected() {
        const selectedIds = [];
        const checkboxes = this.gridBody.querySelectorAll('input[type="checkbox"]:checked');
        
        checkboxes.forEach(checkbox => {
            selectedIds.push(parseInt(checkbox.dataset.id));
        });

        if (selectedIds.length === 0) {
            alert('Please select at least one record to delete.');
            return;
        }

        if (confirm(`Are you sure you want to delete ${selectedIds.length} record(s)?`)) {
            this.dataManager.deleteMultiple(selectedIds);
            this.showNotification(`${selectedIds.length} record(s) deleted successfully!`, 'success');
            this.selectAllCheckbox.checked = false;
            this.render();
        }
    }

    handleSearch() {
        this.dataManager.searchTerm = this.searchInput.value.trim();
        this.render();
    }

    resetForm() {
        this.form.reset();
        this.dataManager.editingId = null;
        this.submitBtn.textContent = 'Add Record';
        this.submitBtn.classList.remove('btn-warning');
        this.submitBtn.classList.add('btn-primary');
        this.cancelBtn.style.display = 'none';
    }

    render() {
        const data = this.dataManager.searchTerm
            ? this.dataManager.search(this.dataManager.searchTerm)
            : this.dataManager.read();

        // Update record count
        this.recordCount.textContent = `Total Records: ${data.length}`;

        // Clear grid
        this.gridBody.innerHTML = '';

        // Show/hide no data message
        if (data.length === 0) {
            this.noData.style.display = 'block';
            document.querySelector('.table-responsive').style.display = 'none';
            return;
        } else {
            this.noData.style.display = 'none';
            document.querySelector('.table-responsive').style.display = 'block';
        }

        // Populate grid
        data.forEach(record => {
            const row = document.createElement('tr');
            
            const statusClass = record.status === 'Active' ? 'status-active' : 'status-inactive';
            
            row.innerHTML = `
                <td><input type="checkbox" data-id="${record.id}"></td>
                <td>${record.id}</td>
                <td>${this.escapeHtml(record.name)}</td>
                <td>${this.escapeHtml(record.email)}</td>
                <td>${this.escapeHtml(record.role)}</td>
                <td><span class="status-badge ${statusClass}">${record.status}</span></td>
                <td class="action-buttons">
                    <button class="btn btn-warning btn-small" data-action="edit" data-id="${record.id}">Edit</button>
                    <button class="btn btn-danger btn-small" data-action="delete" data-id="${record.id}">Delete</button>
                </td>
            `;

            // Add checkbox event listener
            const checkbox = row.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    row.classList.add('selected');
                } else {
                    row.classList.remove('selected');
                    this.selectAllCheckbox.checked = false;
                }
            });

            // Add event listeners for action buttons
            const editBtn = row.querySelector('[data-action="edit"]');
            const deleteBtn = row.querySelector('[data-action="delete"]');
            
            editBtn.addEventListener('click', () => {
                this.handleEdit(record.id);
            });
            
            deleteBtn.addEventListener('click', () => {
                this.handleDelete(record.id);
            });

            this.gridBody.appendChild(row);
        });

        // Reset select all checkbox
        this.selectAllCheckbox.checked = false;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        // Simple notification - could be enhanced with a toast library
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
            color: white;
            border-radius: 5px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 1000;
            font-weight: 600;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transition = 'opacity 0.5s';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    const dataManager = new DataManager();
    app = new UIController(dataManager);
});
