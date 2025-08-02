document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const userEmail = document.getElementById('userEmail');
    const sidebarUserEmail = document.getElementById('sidebarUserEmail');
    const jobsList = document.getElementById('jobsList');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Stat Card Elements
    const totalAppsCard = document.getElementById('totalAppsCard');
    const interviewCard = document.getElementById('interviewCard');
    const offerCard = document.getElementById('offerCard');
    const rejectedCard = document.getElementById('rejectedCard');

    // Filter Elements
    const filterStatus = document.getElementById('filterStatus');
    const filterText = document.getElementById('filterText');
    const clearFilterBtn = document.getElementById('clearFilterBtn');
    
    // State variables
    let currentUser = null;
    let allJobs = []; // A local cache for all job documents

    // --- Firebase Auth State Listener ---
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            userEmail.textContent = user.email;
            sidebarUserEmail.textContent = user.email; 
            fetchAllJobsAndRender(); // Initial load
        } else {
            window.location.href = 'auth.html';
        }
    });

    // --- Logout ---
    logoutBtn.addEventListener('click', () => {
        auth.signOut();
    });

    // --- Event Listeners for Filtering ---
    totalAppsCard.addEventListener('click', () => renderJobs()); // No filter
    interviewCard.addEventListener('click', () => renderJobs('Interview'));
    offerCard.addEventListener('click', () => renderJobs('Offer'));
    rejectedCard.addEventListener('click', () => renderJobs('Rejected'));
    clearFilterBtn.addEventListener('click', () => renderJobs()); // No filter

    // --- Fetches all jobs from Firestore and stores them locally ---
    async function fetchAllJobsAndRender() {
        try {
            const querySnapshot = await db.collection('jobs')
                .where('userId', '==', currentUser.uid)
                .orderBy('appliedDate', 'desc')
                .get();
            
            allJobs = querySnapshot.docs; // Store all docs in our local cache
            renderJobs(); // Render all jobs initially
        } catch (error) {
            console.error('Error fetching jobs:', error);
            jobsList.innerHTML = `<div class="bg-red-100 p-4 rounded-md text-red-700">Error: ${error.message}</div>`;
        }
    }

    // --- Renders jobs based on the local cache and an optional filter ---
    function renderJobs(statusFilter = null) {
        // 1. Calculate stats based on the complete list of jobs
        let interviewCount = 0, offerCount = 0, rejectedCount = 0;
        allJobs.forEach(doc => {
            const job = doc.data();
            if (job.status === 'Interview') interviewCount++;
            else if (job.status === 'Offer') offerCount++;
            else if (job.status === 'Rejected') rejectedCount++;
        });

        document.getElementById('totalAppsStat').textContent = allJobs.length;
        document.getElementById('interviewStat').textContent = interviewCount;
        document.getElementById('offerStat').textContent = offerCount;
        document.getElementById('rejectedStat').textContent = rejectedCount;

        // 2. Filter the jobs to be displayed
        let jobsToDisplay = allJobs;
        if (statusFilter) {
            jobsToDisplay = allJobs.filter(doc => doc.data().status === statusFilter);
            filterStatus.classList.remove('hidden');
            filterText.textContent = `${statusFilter} Applications`;
        } else {
            filterStatus.classList.add('hidden');
        }

        // 3. Render the filtered list of job cards
        jobsList.innerHTML = ''; // Clear the current list
        if (jobsToDisplay.length === 0) {
            jobsList.innerHTML = `<p class="text-center text-gray-500 mt-8">No applications found for this filter.</p>`;
            return;
        }

        jobsToDisplay.forEach(doc => {
            const job = doc.data();
            job.id = doc.id;
            createJobCard(job);
        });
    }

    // --- Creates a single job card element ---
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
            </div>
        `;
        
        jobsList.appendChild(cardLink);
    }

    // Note: Add/Delete/Update logic would go here, and after each action,
    // you would call fetchAllJobsAndRender() to refresh the data.
});
