document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const signupName = document.getElementById('signupName');
    const signupEmail = document.getElementById('signupEmail');
    const signupPassword = document.getElementById('signupPassword');
    const loginError = document.getElementById('loginError');
    const signupError = document.getElementById('signupError');

    // Switch between login and signup forms
    loginTab.addEventListener('click', () => {
        loginTab.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
        loginTab.classList.remove('text-gray-500');
        signupTab.classList.add('text-gray-500');
        signupTab.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    });

    signupTab.addEventListener('click', () => {
        signupTab.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
        signupTab.classList.remove('text-gray-500');
        loginTab.classList.add('text-gray-500');
        loginTab.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    });

    // Login function
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const email = loginEmail.value;
        const password = loginPassword.value;

 auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
        // Signed in
        window.location.href = 'dashboard.html';
    })
            .catch((error) => {
                loginError.textContent = error.message;
                loginError.classList.remove('hidden');
            });
    });

    // Signup function
    signupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const name = signupName.value;
        const email = signupEmail.value;
        const password = signupPassword.value;

        if (password.length < 6) {
            signupError.textContent = 'Password must be at least 6 characters';
            signupError.classList.remove('hidden');
            return;
        }

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed up
                const user = userCredential.user;
                
                // Add user data to Firestore
                return db.collection('users').doc(user.uid).set({
                    name: name,
                    email: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            })
      .then(() => {
    window.location.href = 'dashboard.html';
})
            .catch((error) => {
                signupError.textContent = error.message;
                signupError.classList.remove('hidden');
            });
    });

    // Check if user is already logged in
 auth.onAuthStateChanged((user) => {
    if (user) {
        window.location.href = 'dashboard.html';
    }
});
});