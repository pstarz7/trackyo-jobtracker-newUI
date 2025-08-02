document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const userEmail = document.getElementById('userEmail');
    const sidebarUserEmail = document.getElementById('sidebarUserEmail');
    const addJobBtn = document.getElementById('addJobBtn');
    const addJobModal = document.getElementById('addJobModal');
    const saveJobBtn = document.getElementById('saveJobBtn');
    const cancelJobBtn = document.getElementById('cancelJobBtn');
    const jobsList = document.getElementById('jobsList');
    const jobForm = document.getElementById('jobForm');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Modal elements
    const deleteConfirmationModal = document.getElementById('deleteConfirmationModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    
    // Notification element
    const notificationCard = document.getElementById('notificationCard');

    // Form fields
    const jobRole = document.getElementById('jobRole');
    const jobCompany = document.getElementById('jobCompany');
    const jobStatus = document.getElementById('jobStatus');
    const jobDate = document.getElementById('jobDate');

    // State variables
    let currentUser = null;
    let currentlyEditingJobId = null; // **FIX:** This variable is now properly declared

    // --- Helper Function for Notifications ---
    function showNotification(message, isSuccess = true) {
        const bgColor = isSuccess ? 'bg-green-100' : 'bg-red-100';
        const icon = isSuccess ? '<i class="fas fa-check-circle text-green-500"></i>' : '<i class="fas fa-times-circle text-red-500"></i>';
        notificationCard.innerHTML = `<div class="${bgColor} p-4 rounded-lg flex items-center shadow-md">${icon}<span class="ml-2 text-sm font-medium">${message}</span></div>`;
        
        notificationCard.classList.remove('hidden');
        setTimeout(() => {
            notificationCard.classList.add('hidden');
        }, 4000);
    }

    // --- Firebase Auth State Listener ---
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            userEmail.textContent = user.email;
            sidebarUserEmail.textContent = user.email; 
            loadJobs();
        } else {
            window.location.href = 'auth.html';
        }
    });

    // --- Logout ---
    logoutBtn.addEventListener('click', () => {
        auth.signOut();
    });

    // --- Modal Controls ---
    addJobBtn.addEventListener('click', () => {
        jobForm.reset();
        document.querySelector('#addJobModal h2').textContent = 'Add New Application';
        addJobModal.classList.remove('hidden');
    });
    cancelJobBtn.addEventListener('click', () => {
        addJobModal.classList.add('hidden');
    });

    // --- Save Job Logic ---
    jobForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const jobData = {
            role: jobRole.value.trim(),
            company: jobCompany.value.trim(),
            status: jobStatus.value,
            appliedDate: jobDate.value,
            userId: currentUser.uid,
        };

        if (!jobData.role || !jobData.company || !jobData.appliedDate) {
            showNotification("Please fill out all fields.", false);
            return;
        }

        try {
            await db.collection('jobs').add(jobData);
            addJobModal.classList.add('hidden');
            jobForm.reset();
            loadJobs();
            showNotification('Job saved successfully!');
        } catch (error) {
            console.error("Error saving job:", error);
            showNotification('Failed to save job.', false);
        }
    });
   
    // --- Load Jobs & Stats ---
    async function loadJobs() {
        const querySnapshot = await db.collection('jobs')
            .where('userId', '==', currentUser.uid)
            .orderBy('appliedDate', 'desc')
            .get();

        let interviewCount = 0, offerCount = 0, rejectedCount = 0;

        querySnapshot.forEach(doc => {
            const job = doc.data();
            if (job.status === 'Interview') interviewCount++;
            else if (job.status === 'Offer') offerCount++;
            else if (job.status === 'Rejected') rejectedCount++;
        });

        document.getElementById('totalAppsStat').textContent = querySnapshot.size;
        document.getElementById('interviewStat').textContent = interviewCount;
        document.getElementById('offerStat').textContent = offerCount;
        document.getElementById('rejectedStat').textContent = rejectedCount;

        if (querySnapshot.empty) {
            jobsList.innerHTML = '<p class="text-center text-gray-500 mt-8">No applications yet. Add your first one!</p>';
            return;
        }

        jobsList.innerHTML = '';
        querySnapshot.forEach(doc => {
            const job = doc.data();
            job.id = doc.id;
            createJobCard(job);
        });
    }

    // --- Create Job Card ---
    function createJobCard(job) {
        const cardLink = document.createElement('a');
        cardLink.href = `applicationView.html?id=${job.id}`;
        cardLink.className = 'job-card-item block bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow';
        
        cardLink.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="font-bold text-lg text-gray-800">${job.role}</h3>
                    <p class="text-gray-600">${job.company}</p>
                </div>
                <span class="text-xs font-semibold px-2 py-1 rounded-full ${'status-' + job.status.toLowerCase()}">${job.status}</span>
            </div>
            <div class="flex justify-between items-center mt-4">
                <p class="text-sm text-gray-500">Applied: ${job.appliedDate}</p>
                <button data-id="${job.id}" class="delete-job-btn text-gray-400 hover:text-red-500 text-sm">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        
        jobsList.appendChild(cardLink);

        cardLink.querySelector('.delete-job-btn').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const jobId = e.currentTarget.dataset.id;
            confirmDeleteBtn.dataset.jobId = jobId;
            deleteConfirmationModal.classList.remove('hidden');
        });
    }

    // --- Delete Job Logic ---
    async function deleteJob(jobId) {
        try {
            await db.collection('jobs').doc(jobId).delete();
            loadJobs();
            showNotification('Application deleted.');
        } catch (error) {
            console.error('Error deleting job:', error);
            showNotification('Failed to delete application.', false);
        }
    }
    
    // Event listeners for the delete confirmation modal
    confirmDeleteBtn.addEventListener('click', () => {
        const jobId = confirmDeleteBtn.dataset.jobId;
        deleteJob(jobId);
        deleteConfirmationModal.classList.add('hidden');
    });

    cancelDeleteBtn.addEventListener('click', () => {
        deleteConfirmationModal.classList.add('hidden');
    });
});
