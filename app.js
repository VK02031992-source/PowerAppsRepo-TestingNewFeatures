/**
 * PowerApps MCP Client Application
 * This simulates a client connecting to the MCP server and calling tools
 */

// Simulated MCP Server data (in a real implementation, this would connect to the actual MCP server)
// For a web-based demo, we'll simulate the MCP server responses
class MCPClient {
    constructor() {
        this.serverName = 'powerapps-mcp-server';
        this.version = '1.0.0';
        this.connected = true;
        
        // Simulated data store (matches the MCP server)
        this.data = {
            users: [
                { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
                { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User" },
                { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "User" },
            ],
            tasks: [
                { id: 1, title: "Complete Project", status: "In Progress", assignedTo: 1 },
                { id: 2, title: "Review Code", status: "Pending", assignedTo: 2 },
                { id: 3, title: "Deploy Application", status: "Completed", assignedTo: 1 },
            ],
        };
    }

    // Simulate calling an MCP tool
    async callTool(toolName, args = {}) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));

        switch (toolName) {
            case 'get_users':
                return {
                    content: [{
                        type: 'text',
                        text: JSON.stringify(this.data.users, null, 2)
                    }]
                };

            case 'get_tasks':
                return {
                    content: [{
                        type: 'text',
                        text: JSON.stringify(this.data.tasks, null, 2)
                    }]
                };

            case 'create_task':
                const newTask = {
                    id: this.data.tasks.length + 1,
                    title: args.title,
                    status: args.status,
                    assignedTo: args.assignedTo,
                };
                this.data.tasks.push(newTask);
                return {
                    content: [{
                        type: 'text',
                        text: `Task created successfully:\n${JSON.stringify(newTask, null, 2)}`
                    }]
                };

            case 'update_task_status':
                const task = this.data.tasks.find(t => t.id === args.taskId);
                if (!task) {
                    return {
                        content: [{
                            type: 'text',
                            text: `Error: Task with ID ${args.taskId} not found`
                        }],
                        isError: true
                    };
                }
                task.status = args.status;
                return {
                    content: [{
                        type: 'text',
                        text: `Task status updated successfully:\n${JSON.stringify(task, null, 2)}`
                    }]
                };

            default:
                return {
                    content: [{
                        type: 'text',
                        text: `Unknown tool: ${toolName}`
                    }],
                    isError: true
                };
        }
    }

    // Simulate reading an MCP resource
    async readResource(uri) {
        await new Promise(resolve => setTimeout(resolve, 300));

        switch (uri) {
            case 'powerapps://data/users':
                return {
                    contents: [{
                        uri,
                        mimeType: 'application/json',
                        text: JSON.stringify(this.data.users, null, 2)
                    }]
                };

            case 'powerapps://data/tasks':
                return {
                    contents: [{
                        uri,
                        mimeType: 'application/json',
                        text: JSON.stringify(this.data.tasks, null, 2)
                    }]
                };

            default:
                throw new Error(`Unknown resource: ${uri}`);
        }
    }
}

// Initialize MCP client
const mcpClient = new MCPClient();

// Update connection status
function updateConnectionStatus() {
    const statusIndicator = document.getElementById('statusIndicator');
    const connectionStatus = document.getElementById('connectionStatus');
    
    if (mcpClient.connected) {
        statusIndicator.classList.remove('disconnected');
        connectionStatus.textContent = '✓ Connected to MCP Server';
    } else {
        statusIndicator.classList.add('disconnected');
        connectionStatus.textContent = '✗ Disconnected from MCP Server';
    }
}

// Load users from MCP server
async function loadUsers() {
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = 'Loading...';
    
    try {
        const response = await mcpClient.callTool('get_users');
        const users = JSON.parse(response.content[0].text);
        
        let html = '<table style="width: 100%; border-collapse: collapse;">';
        html += '<tr style="background: #667eea; color: white;">';
        html += '<th style="padding: 10px; text-align: left;">ID</th>';
        html += '<th style="padding: 10px; text-align: left;">Name</th>';
        html += '<th style="padding: 10px; text-align: left;">Email</th>';
        html += '<th style="padding: 10px; text-align: left;">Role</th>';
        html += '</tr>';
        
        users.forEach(user => {
            html += '<tr style="border-bottom: 1px solid #ddd;">';
            html += `<td style="padding: 10px;">${user.id}</td>`;
            html += `<td style="padding: 10px;">${user.name}</td>`;
            html += `<td style="padding: 10px;">${user.email}</td>`;
            html += `<td style="padding: 10px;">${user.role}</td>`;
            html += '</tr>';
        });
        
        html += '</table>';
        usersList.innerHTML = html;
    } catch (error) {
        usersList.innerHTML = `<div class="error-message">Error loading users: ${error.message}</div>`;
    }
}

// Load tasks from MCP server
async function loadTasks() {
    const tasksList = document.getElementById('tasksList');
    tasksList.innerHTML = 'Loading...';
    
    try {
        const response = await mcpClient.callTool('get_tasks');
        const tasks = JSON.parse(response.content[0].text);
        
        let html = '<table style="width: 100%; border-collapse: collapse;">';
        html += '<tr style="background: #667eea; color: white;">';
        html += '<th style="padding: 10px; text-align: left;">ID</th>';
        html += '<th style="padding: 10px; text-align: left;">Title</th>';
        html += '<th style="padding: 10px; text-align: left;">Status</th>';
        html += '<th style="padding: 10px; text-align: left;">Assigned To</th>';
        html += '</tr>';
        
        tasks.forEach(task => {
            const statusColor = 
                task.status === 'Completed' ? '#28a745' :
                task.status === 'In Progress' ? '#ffc107' : '#6c757d';
            
            html += '<tr style="border-bottom: 1px solid #ddd;">';
            html += `<td style="padding: 10px;">${task.id}</td>`;
            html += `<td style="padding: 10px;">${task.title}</td>`;
            html += `<td style="padding: 10px;"><span style="background: ${statusColor}; color: white; padding: 4px 8px; border-radius: 3px; font-size: 0.9em;">${task.status}</span></td>`;
            html += `<td style="padding: 10px;">User ${task.assignedTo}</td>`;
            html += '</tr>';
        });
        
        html += '</table>';
        tasksList.innerHTML = html;
    } catch (error) {
        tasksList.innerHTML = `<div class="error-message">Error loading tasks: ${error.message}</div>`;
    }
}

// Create a new task
async function createTask(event) {
    event.preventDefault();
    
    const title = document.getElementById('taskTitle').value;
    const status = document.getElementById('taskStatus').value;
    const assignedTo = parseInt(document.getElementById('assignedTo').value);
    
    const form = document.getElementById('createTaskForm');
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = 'Creating...';
    
    try {
        const response = await mcpClient.callTool('create_task', {
            title,
            status,
            assignedTo
        });
        
        if (response.isError) {
            alert('Error: ' + response.content[0].text);
        } else {
            alert('Success: Task created successfully!');
            form.reset();
            // Refresh the tasks list
            loadTasks();
        }
    } catch (error) {
        alert('Error creating task: ' + error.message);
    } finally {
        button.disabled = false;
        button.textContent = 'Create Task';
    }
}

// Update task status
async function updateTaskStatus(event) {
    event.preventDefault();
    
    const taskId = parseInt(document.getElementById('updateTaskId').value);
    const status = document.getElementById('updateStatus').value;
    
    const form = document.getElementById('updateTaskForm');
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = 'Updating...';
    
    try {
        const response = await mcpClient.callTool('update_task_status', {
            taskId,
            status
        });
        
        if (response.isError) {
            alert('Error: ' + response.content[0].text);
        } else {
            alert('Success: Task status updated successfully!');
            form.reset();
            // Refresh the tasks list
            loadTasks();
        }
    } catch (error) {
        alert('Error updating task: ' + error.message);
    } finally {
        button.disabled = false;
        button.textContent = 'Update Status';
    }
}

// Initialize the application
window.addEventListener('DOMContentLoaded', () => {
    updateConnectionStatus();
    
    // Auto-load users and tasks on page load
    setTimeout(() => {
        loadUsers();
        loadTasks();
    }, 500);
});
