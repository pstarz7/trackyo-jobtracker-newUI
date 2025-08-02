document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const logoutBtn = document.getElementById('logoutBtn');
    const userEmail = document.getElementById('userEmail');
    const addJobBtn = document.getElementById('addJobBtn');
    const addJobModal = document.getElementById('addJobModal');
    const saveJobBtn = document.getElementById('saveJobBtn');
    const cancelJobBtn = document.getElementById('cancelJobBtn');
    const jobsList = document.getElementById('jobsList');
    // Modal elements
    const deleteConfirmationModal = document.getElementById('deleteConfirmationModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

    // Form fields
    const jobRole = document.getElementById('jobRole');
    const jobCompany = document.getElementById('jobCompany');
    const jobStatus = document.getElementById('jobStatus');
    // Add with other 'const' declarations
const jobDate = document.getElementById('jobDate');

    // Current user
    let currentUser = null;

    // Check auth state
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            userEmail.textContent = user.email;
            loadJobs();
        } else {
            window.location.href = 'auth.html';
        }
    });

    // Logout function
    logoutBtn.addEventListener('click', () => {
        auth.signOut().then(() => {
            window.location.href = 'auth.html';
        });
    });

    // Add job modal
    addJobBtn.addEventListener('click', () => {
        addJobModal.classList.remove('hidden');
    });

    cancelJobBtn.addEventListener('click', () => {
        addJobModal.classList.add('hidden');
        clearJobForm();
    });

    // Save job

  // Replace the old saveJobBtn listener with this one
saveJobBtn.addEventListener('click', async () => {
    const role = jobRole.value.trim();
    const company = jobCompany.value.trim();
    const status = jobStatus.value;
    const appliedDate = jobDate.value; // Get the date from the input

    // Add validation for the date field
    if (!role || !company || !appliedDate) {
        alert('Please fill in all required fields, including the date.');
        return;
    }

    try {
        saveJobBtn.disabled = true;
        saveJobBtn.textContent = 'Saving...';

        // Update the data object to use the manual date
        const jobData = {
            role: role,
            company: company,
            status: status,
            appliedDate: appliedDate, // Use the user-provided date
            userId: currentUser.uid,
        };

        await db.collection('jobs').add(jobData);

        addJobModal.classList.add('hidden');
        clearJobForm();
        loadJobs();

    } catch (error) {
        console.error("Full error object:", error);
        alert(`Failed to save job: ${error.message}`);
    } finally {
        saveJobBtn.disabled = false;
        saveJobBtn.textContent = 'Save';
    }
});
   
    // Load jobs from Firestore
 // In js/app.js

// In js/app.js

async function loadJobs() {
    try {
        jobsList.innerHTML = '<p class="text-gray-500">Loading jobs...</p>';

        const querySnapshot = await db.collection('jobs')
            .where('userId', '==', currentUser.uid)
            .orderBy('appliedDate', 'desc')
            .get();

        // --- Start of New Code: Stats Calculation ---
        let interviewCount = 0;
        let offerCount = 0;
        let rejectedCount = 0;

        // Loop through each job to count the statuses
        querySnapshot.forEach(doc => {
            const job = doc.data();
            if (job.status === 'Interview') {
                interviewCount++;
            } else if (job.status === 'Offer') {
                offerCount++;
            } else if (job.status === 'Rejected') {
                rejectedCount++;
            }
        });

        // Find the stat elements in the HTML and update their text
        document.getElementById('totalAppsStat').textContent = querySnapshot.size;
        document.getElementById('interviewStat').textContent = interviewCount;
        document.getElementById('offerStat').textContent = offerCount;
        document.getElementById('rejectedStat').textContent = rejectedCount;
        // --- End of New Code ---


        // This part remains the same: Display the job cards
        if (querySnapshot.empty) {
            jobsList.innerHTML = '<p class="text-center text-gray-500 mt-8">No applications yet. Add your first one!</p>';
            return;
        }

        jobsList.innerHTML = '';
        querySnapshot.forEach(doc => {
            const job = doc.data();
            job.id = doc.id;
            createJobCard(job); // Assuming you have this function to create each card
        });

    } catch (error) {
        console.error('Error loading jobs:', error);
        jobsList.innerHTML = `<div class="bg-red-100 p-4 rounded-md text-red-700">Error: ${error.message}</div>`;
    }
}
// Replace the old createJobCard function with this one
// In js/app.js

// New updated function
// In js/app.js

function createJobCard(job) {
    // Create an anchor tag that will wrap the card
    const cardLink = document.createElement('a');
    cardLink.href = `applicationView.html?id=${job.id}`; // Pass the job ID in the URL
    cardLink.className = 'job-card-item block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100';
    cardLink.dataset.id = job.id;

    const date = job.appliedDate || 'No date';
    const statusClass = `status-${job.status.toLowerCase()}`;

    // Use innerHTML on the anchor tag
    cardLink.innerHTML = `
        <div class="flex flex-col md:flex-row md:justify-between md:items-center">
            <div class="mb-4 md:mb-0">
                <h3 class="text-lg font-semibold text-gray-800">${job.role}</h3>
                <p class="text-gray-600">${job.company}</p>
            </div>
            <div class="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                <span class="px-3 py-1 rounded-full text-sm ${statusClass}">${job.status}</span>
                <span class="text-gray-500 text-sm">Applied on: ${date}</span>
                <button class="delete-job-btn text-red-500 hover:text-red-700 p-1" data-id="${job.id}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `;

    jobsList.appendChild(cardLink);

    const deleteBtn = cardLink.querySelector('.delete-job-btn');
    deleteBtn.addEventListener('click', (e) => {
        // Prevent the link from being followed when the delete button is clicked
        e.preventDefault();
        e.stopPropagation();

        const jobId = e.currentTarget.dataset.id;
        deleteConfirmationModal.classList.remove('hidden');
        confirmDeleteBtn.dataset.jobId = jobId;
    });
}
// Add event listeners for the modal buttons
cancelDeleteBtn.addEventListener('click', () => {
    deleteConfirmationModal.classList.add('hidden');
});

confirmDeleteBtn.addEventListener('click', () => {
    const jobId = confirmDeleteBtn.dataset.jobId;
    deleteJob(jobId);
    deleteConfirmationModal.classList.add('hidden');
});


// Replace the old deleteJob function with this one
async function deleteJob(jobId) {
    try {
        await db.collection('jobs').doc(jobId).delete();
        console.log('Job deleted successfully');

        const cardToRemove = document.querySelector(`.bg-white[data-id="${jobId}"]`);
        if (cardToRemove) {
            cardToRemove.remove();
        }
    } catch (error) {
        console.error('Error deleting job:', error);
        alert(`Failed to delete job: ${error.message}`);
    }
}
// Ensure the deleteJob function can find and remove the correct card.
// In js/app.js

// New updated function
async function deleteJob(jobId) {
    try {
        await db.collection('jobs').doc(jobId).delete();
        console.log('Job deleted successfully');

        // Use the new, more specific selector to find the card
        const cardToRemove = document.querySelector(`.job-card-item[data-id="${jobId}"]`);
        if (cardToRemove) {
            cardToRemove.remove();
        }
    } catch (error) {
        console.error('Error deleting job:', error);
        alert(`Failed to delete job: ${error.message}`);
    }
}
    // function createJobCard(job, jobId) {
    //     const jobCard = document.createElement('div');
    //     jobCard.className = 'job-card bg-white rounded-lg shadow-md p-6 relative';
    //     jobCard.dataset.id = jobId;

    //     const date = job.createdAt ? job.createdAt.toDate().toLocaleDateString() : 'N/A';

    //     jobCard.innerHTML = `
    //     <div class="flex justify-between items-start mb-2">
    //         <h3 class="text-xl font-bold text-gray-800">${job.role}</h3>
    //         <span class="status-${job.status.toLowerCase()} text-xs font-semibold px-2 py-1 rounded-full">${job.status}</span>
    //     </div>
    //     <p class="text-gray-600 mb-4">${job.company}</p>
    //     <div class="flex justify-between items-center">
    //         <span class="text-sm text-gray-500">Applied: ${date}</span>
    //         <div class="flex space-x-2">
    //             <button class="edit-job text-blue-500 hover:text-blue-700 p-1">
    //                 <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    //                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    //                 </svg>
    //             </button>
    //             <button class="delete-job text-red-500 hover:text-red-700 p-1">
    //                 <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    //                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    //                 </svg>
    //             </button>
    //         </div>
    //     </div>
    // `;


    function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-md shadow-lg text-white ${
        type === 'error' ? 'bg-red-500' : 
        type === 'success' ? 'bg-green-500' : 'bg-blue-500'
    }`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('opacity-0', 'transition-opacity', 'duration-500');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

    async function updateJob(jobId, updatedData) {
        try {
            await db.collection('jobs').doc(jobId).update({
                ...updatedData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log('Job updated successfully');
            showToast('Job updated successfully', 'success');
            loadJobs(); // Refresh the list
        } catch (error) {
            console.error('Error updating job:', error);
            showToast(`Failed to update job: ${error.message}`, 'error');
        }
    }
    async function deleteJob(jobId) {
        if (!confirm('Are you sure you want to delete this job application?')) return;

        try {
            await db.collection('jobs').doc(jobId).delete();
            console.log('Job deleted successfully');

            // Remove the job card from UI
            document.querySelector(`.job-card[data-id="${jobId}"]`)?.remove();

            // Show success message
            showToast('Job deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting job:', error);
            showToast(`Failed to delete job: ${error.message}`, 'error');
        }
    }

// Replace the old clearJobForm function with this one
function clearJobForm() {
    jobRole.value = '';
    jobCompany.value = '';
    jobStatus.value = 'Applied';
    jobDate.value = ''; // Reset the date input
    currentlyEditingJobId = null;
    document.querySelector('#addJobModal h3').textContent = 'Add New Job Application';
    saveJobBtn.textContent = 'Save';
}
});