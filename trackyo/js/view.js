document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get('id');

    if (!jobId) {
        window.location.href = 'dashboard.html';
        return;
    }

    // --- Get All UI Elements ---
    const jobTitle = document.getElementById('jobTitle');
    const jobStatusBadge = document.getElementById('jobStatusBadge');
    const jobCompany = document.getElementById('jobCompany');
    const jobDate = document.getElementById('jobDate');
    const updateForm = document.getElementById('updateForm');
    const updateStatus = document.getElementById('updateStatus');
    const newNoteInput = document.getElementById('newNoteInput');
    const notesContainer = document.getElementById('notesContainer');
    
    // Application Delete Elements
    const deleteJobBtn = document.getElementById('deleteJobBtn');
    const deleteAppModal = document.getElementById('deleteAppModal');
    const confirmAppDelete = document.getElementById('confirmAppDelete');
    const cancelAppDelete = document.getElementById('cancelAppDelete');

    // Note Delete Elements
    const deleteNoteModal = document.getElementById('deleteNoteModal');
    const confirmNoteDelete = document.getElementById('confirmNoteDelete');
    const cancelNoteDelete = document.getElementById('cancelNoteDelete');
    let noteToDelete = null; // To store the note object to be deleted

    // Notification Element
    const notificationCard = document.getElementById('notificationCard');

    // --- Helper Function for Notifications ---
    function showNotification(message, isSuccess = true) {
        const bgColor = isSuccess ? 'bg-green-100' : 'bg-red-100';
        const icon = isSuccess ? '<i class="fas fa-check-circle text-green-500"></i>' : '<i class="fas fa-times-circle text-red-500"></i>';
        notificationCard.innerHTML = `<div class="${bgColor} p-4 rounded-lg flex items-center shadow-md">${icon}<span class="ml-2">${message}</span></div>`;
        notificationCard.classList.remove('hidden');
        setTimeout(() => notificationCard.classList.add('hidden'), 4000);
    }

    // --- Renders a single note with a delete button ---
    function renderNote(note, index) {
        const noteDiv = document.createElement('div');
        noteDiv.className = 'bg-gray-50 p-3 rounded-md border flex justify-between items-start';
        noteDiv.setAttribute('data-note-index', index); // Keep track of the note's position

        const contentDiv = document.createElement('div');
        const noteText = document.createElement('p');
        noteText.textContent = note.text;
        const noteTimestamp = document.createElement('p');
        noteTimestamp.className = 'text-xs text-gray-500 mt-1';
        noteTimestamp.textContent = new Date(note.timestamp.seconds * 1000).toLocaleString();
        
        contentDiv.appendChild(noteText);
        contentDiv.appendChild(noteTimestamp);

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fas fa-trash-alt text-gray-400 hover:text-red-500"></i>';
        deleteButton.onclick = () => {
            noteToDelete = note; // Store the note object
            deleteNoteModal.classList.remove('hidden');
        };

        noteDiv.appendChild(contentDiv);
        noteDiv.appendChild(deleteButton);
        notesContainer.prepend(noteDiv);
    }
    
    // --- Fetches and re-renders all notes ---
    function refreshNotes() {
        db.collection('jobs').doc(jobId).get().then(doc => {
            if (doc.exists && doc.data().notes) {
                notesContainer.innerHTML = '';
                doc.data().notes.sort((a, b) => b.timestamp - a.timestamp).forEach(renderNote);
            }
        });
    }

    // --- Initial Data Load ---
    db.collection('jobs').doc(jobId).get().then(doc => {
        if (doc.exists) {
            const job = doc.data();
            jobTitle.textContent = job.role;
            jobCompany.textContent = job.company;
            jobDate.textContent = job.appliedDate;
            jobStatusBadge.textContent = job.status;
            jobStatusBadge.className = `px-3 py-1 rounded-full text-sm font-medium status-${job.status.toLowerCase()}`;
            
            // Populate status dropdown
            ['Applied', 'Interview', 'Offer', 'Rejected'].forEach(status => {
                const option = document.createElement('option');
                option.value = status;
                option.textContent = status;
                if (job.status === status) option.selected = true;
                updateStatus.appendChild(option);
            });
            
            refreshNotes(); // Initial load of notes
        }
    });

    // --- Event Listener for Update Form ---
    updateForm.addEventListener('submit', e => {
        e.preventDefault();
        const dataToUpdate = { status: updateStatus.value };
        const noteText = newNoteInput.value.trim();

        if (noteText) {
            dataToUpdate.notes = firebase.firestore.FieldValue.arrayUnion({
                text: noteText,
                timestamp: new Date()
            });
        }

        db.collection('jobs').doc(jobId).update(dataToUpdate).then(() => {
            showNotification('Application updated!');
            if (noteText) {
                newNoteInput.value = '';
                refreshNotes(); // Refresh to show the new note
            }
            jobStatusBadge.textContent = updateStatus.value;
            jobStatusBadge.className = `px-3 py-1 rounded-full text-sm font-medium status-${updateStatus.value.toLowerCase()}`;
        }).catch(() => showNotification('Update failed.', false));
    });

    // --- Event Listeners for Application Deletion ---
    deleteJobBtn.addEventListener('click', () => deleteAppModal.classList.remove('hidden'));
    cancelAppDelete.addEventListener('click', () => deleteAppModal.classList.add('hidden'));
    confirmAppDelete.addEventListener('click', () => {
        db.collection('jobs').doc(jobId).delete().then(() => {
            showNotification('Application deleted.');
            setTimeout(() => window.location.href = 'dashboard.html', 2000);
        }).catch(() => showNotification('Deletion failed.', false));
    });

    // --- Event Listeners for Note Deletion ---
    cancelNoteDelete.addEventListener('click', () => deleteNoteModal.classList.add('hidden'));
    confirmNoteDelete.addEventListener('click', () => {
        if (!noteToDelete) return;

        db.collection('jobs').doc(jobId).update({
            notes: firebase.firestore.FieldValue.arrayRemove(noteToDelete)
        }).then(() => {
            showNotification('Note deleted.');
            refreshNotes(); // Refresh notes list
            deleteNoteModal.classList.add('hidden');
            noteToDelete = null;
        }).catch(() => showNotification('Could not delete note.', false));
    });
});