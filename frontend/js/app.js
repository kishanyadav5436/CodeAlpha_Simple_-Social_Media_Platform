const API_URL = 'http://localhost:5000/api';

// DOM Elements
const authSection = document.getElementById('auth-section');
const feedSection = document.getElementById('feed-section');
const profileSection = document.getElementById('profile-section');
const mainNav = document.getElementById('main-nav');

// Tabs
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const loginContainer = document.getElementById('login-form-container');
const registerContainer = document.getElementById('register-form-container');

// Forms
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const createPostForm = document.getElementById('create-post-form');

// State
let currentUser = JSON.parse(localStorage.getItem('user')) || null;

// Initialize
function init() {
    setupEventListeners();
    checkAuthStatus();
}

function setupEventListeners() {
    // Auth Tabs
    tabLogin.addEventListener('click', () => switchTab('login'));
    tabRegister.addEventListener('click', () => switchTab('register'));

    // Form Submissions
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    createPostForm.addEventListener('submit', handleCreatePost);

    // Nav
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    document.getElementById('nav-feed').addEventListener('click', (e) => {
        e.preventDefault();
        showSection('feed');
        loadPosts();
    });
    document.getElementById('nav-profile').addEventListener('click', (e) => {
        e.preventDefault();
        showSection('profile');
        loadProfile();
    });
}

function switchTab(tab) {
    document.getElementById('auth-error').textContent = '';
    if (tab === 'login') {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        loginContainer.classList.remove('hidden');
        registerContainer.classList.add('hidden');
    } else {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        registerContainer.classList.remove('hidden');
        loginContainer.classList.add('hidden');
    }
}

function checkAuthStatus() {
    if (currentUser && currentUser.token) {
        showSection('feed');
        mainNav.classList.remove('hidden');
        loadPosts();
    } else {
        showSection('auth');
        mainNav.classList.add('hidden');
    }
}

function showSection(section) {
    authSection.classList.add('hidden');
    feedSection.classList.add('hidden');
    profileSection.classList.add('hidden');

    if (section === 'auth') authSection.classList.remove('hidden');
    if (section === 'feed') feedSection.classList.remove('hidden');
    if (section === 'profile') profileSection.classList.remove('hidden');
}

// Auth Handlers
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.message);
        
        loginSuccess(data);
    } catch (err) {
        document.getElementById('auth-error').textContent = err.message;
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.message);
        
        loginSuccess(data);
    } catch (err) {
        document.getElementById('auth-error').textContent = err.message;
    }
}

function loginSuccess(userData) {
    currentUser = userData;
    localStorage.setItem('user', JSON.stringify(userData));
    loginForm.reset();
    registerForm.reset();
    document.getElementById('auth-error').textContent = '';
    checkAuthStatus();
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('user');
    checkAuthStatus();
}

// Post Handlers
async function loadPosts() {
    const container = document.getElementById('posts-container');
    const loader = document.getElementById('posts-loader');
    
    // Clear existing posts except loader
    Array.from(container.children).forEach(child => {
        if (child.id !== 'posts-loader') child.remove();
    });
    
    loader.classList.remove('hidden');
    
    try {
        const res = await fetch(`${API_URL}/posts`);
        const posts = await res.json();
        
        loader.classList.add('hidden');
        
        if (posts.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'error-msg';
            empty.textContent = 'No posts yet. Be the first to post!';
            container.appendChild(empty);
            return;
        }
        
        posts.forEach(post => {
            const isLiked = post.likes.some(like => like._id === currentUser._id || like === currentUser._id);
            const postEl = document.createElement('div');
            postEl.className = 'post-card glass-panel';
            postEl.innerHTML = `
                <div class="post-header">
                    <div class="post-avatar">${post.author.username.charAt(0).toUpperCase()}</div>
                    <div class="post-meta">
                        <h4>${post.author.username}</h4>
                        <span>${new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="post-content">${post.content}</div>
                <div class="post-footer">
                    <button class="action-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike('${post._id}')">
                        <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i>
                        <span>${post.likes.length} Likes</span>
                    </button>
                </div>
            `;
            container.appendChild(postEl);
        });
    } catch (err) {
        loader.classList.add('hidden');
        console.error('Error loading posts:', err);
    }
}

async function handleCreatePost(e) {
    e.preventDefault();
    const contentInput = document.getElementById('post-content');
    const content = contentInput.value;
    
    try {
        const res = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({ content })
        });
        
        if (res.ok) {
            contentInput.value = '';
            loadPosts();
        }
    } catch (err) {
        console.error('Error creating post:', err);
    }
}

window.toggleLike = async function(postId) {
    if (!currentUser) return;
    
    try {
        const res = await fetch(`${API_URL}/posts/${postId}/like`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${currentUser.token}`
            }
        });
        
        if (res.ok) {
            loadPosts(); // Reload posts to show updated likes
        }
    } catch (err) {
        console.error('Error toggling like:', err);
    }
};

// Profile Handlers
async function loadProfile() {
    try {
        const res = await fetch(`${API_URL}/users/${currentUser._id}`);
        const data = await res.json();
        
        document.getElementById('profile-username').textContent = data.username;
        document.getElementById('profile-email').textContent = data.email;
        document.getElementById('stat-followers').textContent = data.followers.length;
        document.getElementById('stat-following').textContent = data.following.length;
    } catch (err) {
        console.error('Error loading profile:', err);
    }
}

// Start app
init();
