# Code Apps Template - Editable Data Grid

A complete, ready-to-use template for managing data with full CRUD (Create, Read, Update, Delete) operations through an editable grid interface.

## Features

### Core Functionality
- ✅ **Create**: Add new records with a simple form
- ✅ **Read**: View all records in an organized data grid
- ✅ **Update**: Edit existing records inline
- ✅ **Delete**: Remove single or multiple records

### Additional Features
- 🔍 **Search & Filter**: Real-time search across all fields
- ☑️ **Bulk Operations**: Select multiple records for batch deletion
- 💾 **Data Persistence**: Automatic local storage (browser-based)
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🎨 **Modern UI**: Clean, professional interface with gradient themes
- ✨ **Status Badges**: Visual indicators for record status
- 🔔 **Notifications**: User feedback for all operations

## Getting Started

### Quick Start
1. Open `index.html` in any modern web browser
2. No installation or dependencies required
3. Start adding, editing, and managing records immediately

### Sample Data
The template comes pre-loaded with 3 sample records to demonstrate functionality:
- John Doe (Developer)
- Jane Smith (Manager)
- Bob Johnson (Designer)

## Usage Guide

### Adding New Records
1. Fill in the form fields at the top:
   - **Name**: Full name of the person/entity
   - **Email**: Email address
   - **Role**: Job title or role
   - **Status**: Active or Inactive
2. Click "Add Record" button
3. New record appears in the grid immediately

### Editing Records
1. Click the "Edit" button on any row
2. Form populates with existing data
3. Modify the fields as needed
4. Click "Update Record" to save changes
5. Click "Cancel Edit" to discard changes

### Deleting Records
**Single Delete:**
- Click the "Delete" button on any row
- Confirm the deletion in the dialog

**Bulk Delete:**
1. Select checkboxes for multiple records
2. Click "Delete Selected" button
3. Confirm the bulk deletion

### Searching Data
1. Enter search term in the search box
2. Click "Search" or press Enter
3. Grid filters to show matching records
4. Click "Clear" to reset the view

### Selecting All Records
- Click the checkbox in the header row to select/deselect all records

## Technical Details

### File Structure
```
code-apps-template/
├── index.html      # Main HTML structure
├── styles.css      # Complete styling and responsive design
├── app.js          # JavaScript logic for CRUD operations
└── README.md       # This documentation file
```

### Technology Stack
- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with flexbox and grid
- **Vanilla JavaScript**: No framework dependencies
- **LocalStorage API**: Client-side data persistence

### Data Structure
Each record contains:
```javascript
{
    id: Number,        // Auto-generated unique identifier
    name: String,      // Full name
    email: String,     // Email address
    role: String,      // Role/position
    status: String     // "Active" or "Inactive"
}
```

### Browser Compatibility
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Opera (latest)

### Data Storage
- Data is stored in browser's localStorage
- Persists between sessions
- Data is stored per-browser/per-device
- Clear browser data to reset

## Customization

### Adding New Fields
1. Add input field in `index.html` form section
2. Add table header in `<thead>`
3. Update `DataManager.create()` and `DataManager.update()` in `app.js`
4. Modify the grid rendering in `UIController.render()`

### Changing Colors
Edit the CSS variables in `styles.css`:
- Primary gradient: `#667eea` to `#764ba2`
- Button colors: `.btn-primary`, `.btn-danger`, etc.
- Status badges: `.status-active`, `.status-inactive`

### Adding Validation
Add validation logic in `UIController.handleFormSubmit()`:
```javascript
if (!formData.email.includes('@')) {
    alert('Invalid email address');
    return;
}
```

## Code Architecture

### DataManager Class
Handles all data operations:
- `create(record)` - Add new record
- `read(filter)` - Get records with optional filter
- `update(id, updates)` - Modify existing record
- `delete(id)` - Remove single record
- `deleteMultiple(ids)` - Remove multiple records
- `search(term)` - Filter records by search term

### UIController Class
Manages user interface:
- Form handling and validation
- Grid rendering and updates
- Event listener management
- User notifications
- Search and filter UI

## Security Considerations

- Input sanitization is implemented via `escapeHtml()` method
- All user input is escaped before rendering
- No server-side code (client-side only)
- Data stored locally in user's browser

## Future Enhancements

Potential improvements for this template:
- Export data to CSV/Excel
- Import data from files
- Sorting by column headers
- Pagination for large datasets
- Advanced filtering options
- Data validation rules
- Print functionality
- Dark mode toggle
- Undo/Redo operations
- Backend API integration

## Troubleshooting

### Data Not Persisting
- Check browser's localStorage is enabled
- Verify not in private/incognito mode
- Check browser storage limits

### Search Not Working
- Ensure search term is not empty
- Click "Clear" to reset filters
- Refresh the page to reload data

### Styling Issues
- Clear browser cache
- Check CSS file is loaded correctly
- Verify viewport meta tag is present

## License

This template is free to use for personal and commercial projects.

## Support

For issues or questions:
1. Check this README documentation
2. Review the inline code comments
3. Test in different browsers
4. Check browser console for errors

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Author**: Code Apps Template  
