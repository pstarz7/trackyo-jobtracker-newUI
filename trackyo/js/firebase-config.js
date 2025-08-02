// document.addEventListener('DOMContentLoaded', () => {
//     const params = new URLSearchParams(window.location.search);
//     const jobId = params.get('id');

//     if (!jobId) {
//         window.location.href = 'dashboard.html';
//         return;
//     }

//     // --- Get All UI Elements ---
//     const jobTitle = document.getElementById('jobTitle');
//     const jobStatusBadge = document.getElementById('jobStatusBadge');
//     const jobCompany = document.getElementById('jobCompany');
//     const jobDate = document.getElementById('jobDate');
//     const updateForm = document.getElementById('updateForm');
//     const updateStatus = document.getElementById('updateStatus');
//     const newNoteInput = document.getElementById('newNoteInput');
//     const notesContainer = document.getElementById('notesContainer');
    
//     // Delete and notification elements
//     const deleteJobBtn = document.getElementById('deleteJobBtn');
//     const deleteConfirmationModal = document.getElementById('deleteConfirmationModal');
//     const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
//     const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
//     const notificationCard = document.getElementById('notificationCard');
//     const notificationMessage = document.getElementById('notificationMessage');
//     const notificationIcon = document.getElementById('notificationIcon');
//     const closeNotificationBtn = document.getElementById('closeNotificationBtn');

//     // --- Helper Function for Notifications ---
//     function showNotification(message, isSuccess = true) {
//         notificationMessage.textContent = message;
//         if (isSuccess) {
//             notificationCard.classList.remove('bg-red-100');
//             notificationCard.classList.add('bg-green-100');
//             notificationIcon.innerHTML = `<i class="fas fa-check-circle text-green-500 text-2xl"></i>`;
//         } else {
//             notificationCard.classList.remove('bg-green-100');
//             notificationCard.classList.add('bg-red-100');
//             notificationIcon.innerHTML = `<i class="fas fa-times-circle text-red-500 text-2xl"></i>`;
//         }
//         notificationCard.classList.remove('hidden');
//         setTimeout(() => notificationCard.classList.add('hidden'), 4000); // Auto-hide after 4 seconds
//     }

//     closeNotificationBtn.addEventListener('click', () => notificationCard.classList.add('hidden'));

//     // --- Function to Render a Note ---
//     function renderNote(note) {
//         const noteDiv = document.createElement('div');
//         noteDiv.className = 'bg-gray-50 p-3 rounded-md border border-gray-200';
//         const noteText = document.createElement('p');
//         noteText.className = 'text-gray-800';
//         noteText.textContent = note.text;
//         const noteTimestamp = document.createElement('p');
//         noteTimestamp.className = 'text-xs text-gray-500 mt-1';
//         noteTimestamp.textContent = new Date(note.timestamp.seconds * 1000).toLocaleString();
//         noteDiv.appendChild(noteText);
//         noteDiv.appendChild(noteTimestamp);
//         notesContainer.prepend(noteDiv);
//     }

//     // --- Fetch and Display Job Data ---
//     db.collection('jobs').doc(jobId).get().then(doc => {
//         if (doc.exists) {
//             const job = doc.data();
//             jobTitle.textContent = job.role;
//             jobCompany.textContent = job.company;
//             jobDate.textContent = job.appliedDate;
//             jobStatusBadge.textContent = job.status;
//             jobStatusBadge.className = `px-3 py-1 rounded-full text-sm font-medium status-${job.status.toLowerCase()}`;
//             updateStatus.value = job.status;
//             if (job.notes && Array.isArray(job.notes)) {
//                 notesContainer.innerHTML = '';
//                 job.notes.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds).forEach(renderNote);
//             }
//         } else {
//             window.location.href = 'dashboard.html';
//         }
//     }).catch(error => console.error("Error getting document:", error));

//     // --- Event Listener for Form Submission (Update) ---
//     updateForm.addEventListener('submit', (e) => {
//         e.preventDefault();
//         const newStatus = updateStatus.value;
//         const noteText = newNoteInput.value.trim();
//         const dataToUpdate = { status: newStatus };

//         if (noteText) {
//             dataToUpdate.notes = firebase.firestore.FieldValue.arrayUnion({ text: noteText, timestamp: new Date() });
//         }

//         db.collection('jobs').doc(jobId).update(dataToUpdate).then(() => {
//             showNotification('Application updated successfully!');
//             jobStatusBadge.textContent = newStatus;
//             jobStatusBadge.className = `px-3 py-1 rounded-full text-sm font-medium status-${newStatus.toLowerCase()}`;
//             if (noteText) {
//                 renderNote({ text: noteText, timestamp: { seconds: Math.floor(Date.now() / 1000) } });
//                 newNoteInput.value = '';
//             }
//         }).catch(error => showNotification('Failed to update application.', false));
//     });

//     // --- Event Listeners for Delete Functionality ---
//     deleteJobBtn.addEventListener('click', () => deleteConfirmationModal.classList.remove('hidden'));
//     cancelDeleteBtn.addEventListener('click', () => deleteConfirmationModal.classList.add('hidden'));

//     confirmDeleteBtn.addEventListener('click', () => {
//         db.collection('jobs').doc(jobId).delete().then(() => {
//             deleteConfirmationModal.classList.add('hidden');
//             showNotification('Application deleted successfully!');
//             setTimeout(() => window.location.href = 'dashboard.html', 2000); // Redirect after 2 seconds
//         }).catch(error => {
//             deleteConfirmationModal.classList.add('hidden');
//             showNotification('Failed to delete application.', false);
//         });
//     });
// });



// Your web app's Firebase configuration
const firebaseConfig = {
   apiKey: "AIzaSyBAAa8gcDfFQicKxhuTBq8Bkk_GYekl3VA",
    authDomain: "trackyo-job-tracker.firebaseapp.com",
    projectId: "trackyo-job-tracker",
    storageBucket: "trackyo-job-tracker.appspot.com",
    messagingSenderId: "121657861420",
    appId: "1:121657861420:web:e90fdc607c0b6695497889",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore
const auth = firebase.auth();
const db = firebase.firestore();