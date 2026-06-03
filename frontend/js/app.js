const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';

// ========== DOM Elements ==========
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

// User Modal
const userModalOverlay = document.getElementById('user-modal-overlay');
const userModalClose = document.getElementById('user-modal-close');

// Toast
const toastEl = document.getElementById('toast');
const toastMsg = document.getElementById('toast-message');

// State
let currentUser = JSON.parse(localStorage.getItem('user')) || null;

// ========== Utility: Escape HTML to prevent XSS ==========
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== Toast ==========
function showToast(message) {
    toastMsg.textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 2500);
}

// ========== Initialize ==========
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

    // User Modal close
    userModalClose.addEventListener('click', closeUserModal);
    userModalOverlay.addEventListener('click', (e) => {
        if (e.target === userModalOverlay) closeUserModal();
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

// ========== Auth Handlers ==========
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

// ========== Post Handlers ==========
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
            const postEl = createPostElement(post, isLiked);
            container.appendChild(postEl);
        });
    } catch (err) {
        loader.classList.add('hidden');
        console.error('Error loading posts:', err);
    }
}

function createPostElement(post, isLiked) {
    const postEl = document.createElement('div');
    postEl.className = 'post-card glass-panel';
    postEl.setAttribute('data-post-id', post._id);

    const authorId = post.author._id || post.author;
    const authorName = post.author.username || 'Unknown';
    const isOwnPost = authorId === currentUser._id;

    postEl.innerHTML = `
        <div class="post-header">
            <div class="post-avatar">${escapeHtml(authorName.charAt(0).toUpperCase())}</div>
            <div class="post-meta">
                <h4 class="post-author-link" data-user-id="${authorId}" title="${isOwnPost ? 'View your profile' : 'View ' + escapeHtml(authorName) + '\'s profile'}">${escapeHtml(authorName)}</h4>
                <span>${new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
        </div>
        <div class="post-content">${escapeHtml(post.content)}</div>
        <div class="post-footer">
            <button class="action-btn ${isLiked ? 'liked' : ''}" data-action="like" data-post-id="${post._id}">
                <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i>
                <span>${post.likes.length} ${post.likes.length === 1 ? 'Like' : 'Likes'}</span>
            </button>
            <button class="action-btn comment-toggle-btn" data-action="toggle-comments" data-post-id="${post._id}">
                <i class="far fa-comment"></i>
                <span>Comments</span>
            </button>
        </div>
        <div class="comments-section hidden" id="comments-${post._id}">
            <div class="comments-list" id="comments-list-${post._id}">
                <div class="comments-loader hidden"><i class="fas fa-spinner fa-spin"></i></div>
            </div>
            <form class="comment-form" data-post-id="${post._id}">
                <input type="text" class="comment-input" placeholder="Write a comment..." required>
                <button type="submit" class="comment-submit-btn"><i class="fas fa-paper-plane"></i></button>
            </form>
        </div>
    `;

    // Event: Like button
    postEl.querySelector('[data-action="like"]').addEventListener('click', () => toggleLike(post._id));

    // Event: Toggle comments
    postEl.querySelector('[data-action="toggle-comments"]').addEventListener('click', () => toggleComments(post._id));

    // Event: Author name click → open profile
    postEl.querySelector('.post-author-link').addEventListener('click', () => {
        if (isOwnPost) {
            showSection('profile');
            loadProfile();
        } else {
            openUserProfile(authorId);
        }
    });

    // Event: Comment form submit
    postEl.querySelector('.comment-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const input = e.target.querySelector('.comment-input');
        handleAddComment(post._id, input.value.trim(), input);
    });

    return postEl;
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
            showToast('Post created successfully!');
            loadPosts();
        } else {
            const data = await res.json();
            showToast(data.message || 'Failed to create post');
        }
    } catch (err) {
        console.error('Error creating post:', err);
        showToast('Error creating post');
    }
}

// ========== Like ==========
async function toggleLike(postId) {
    if (!currentUser) return;
    
    try {
        const res = await fetch(`${API_URL}/posts/${postId}/like`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${currentUser.token}`
            }
        });
        
        if (res.ok) {
            loadPosts();
        }
    } catch (err) {
        console.error('Error toggling like:', err);
    }
}

// ========== Comments ==========
async function toggleComments(postId) {
    const section = document.getElementById(`comments-${postId}`);
    if (!section) return;

    if (section.classList.contains('hidden')) {
        section.classList.remove('hidden');
        loadComments(postId);
    } else {
        section.classList.add('hidden');
    }
}

async function loadComments(postId) {
    const listEl = document.getElementById(`comments-list-${postId}`);
    if (!listEl) return;

    const loader = listEl.querySelector('.comments-loader');
    loader.classList.remove('hidden');

    // Remove old comments (keep loader)
    Array.from(listEl.children).forEach(child => {
        if (!child.classList.contains('comments-loader')) child.remove();
    });

    try {
        const res = await fetch(`${API_URL}/posts/${postId}/comments`);
        const comments = await res.json();

        loader.classList.add('hidden');

        if (comments.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'no-comments';
            empty.textContent = 'No comments yet. Be the first!';
            listEl.appendChild(empty);
            return;
        }

        comments.forEach(comment => {
            const commentEl = document.createElement('div');
            commentEl.className = 'comment-item';
            const authorName = comment.author ? comment.author.username : 'Unknown';
            commentEl.innerHTML = `
                <div class="comment-avatar">${escapeHtml(authorName.charAt(0).toUpperCase())}</div>
                <div class="comment-body">
                    <span class="comment-author">${escapeHtml(authorName)}</span>
                    <span class="comment-text">${escapeHtml(comment.content)}</span>
                    <span class="comment-time">${timeAgo(comment.createdAt)}</span>
                </div>
            `;
            listEl.appendChild(commentEl);
        });
    } catch (err) {
        loader.classList.add('hidden');
        console.error('Error loading comments:', err);
    }
}

async function handleAddComment(postId, content, inputEl) {
    if (!content || !currentUser) return;

    try {
        const res = await fetch(`${API_URL}/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({ content })
        });

        if (res.ok) {
            inputEl.value = '';
            loadComments(postId);
            showToast('Comment added!');
        }
    } catch (err) {
        console.error('Error adding comment:', err);
        showToast('Error adding comment');
    }
}

function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + 'd ago';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ========== Profile (Own) ==========
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

// ========== User Profile Modal (Other Users) ==========
async function openUserProfile(userId) {
    userModalOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Reset modal
    document.getElementById('modal-user-name').textContent = 'Loading...';
    document.getElementById('modal-stat-followers').textContent = '—';
    document.getElementById('modal-stat-following').textContent = '—';
    const followBtn = document.getElementById('follow-btn');
    followBtn.classList.add('hidden');

    try {
        const res = await fetch(`${API_URL}/users/${userId}`);
        const user = await res.json();

        document.getElementById('modal-user-avatar').innerHTML = `<span>${escapeHtml(user.username.charAt(0).toUpperCase())}</span>`;
        document.getElementById('modal-user-name').textContent = user.username;
        document.getElementById('modal-stat-followers').textContent = user.followers.length;
        document.getElementById('modal-stat-following').textContent = user.following.length;

        // Show follow button (not for self)
        if (userId !== currentUser._id) {
            const isFollowing = user.followers.some(f => {
                const fId = typeof f === 'object' ? f._id : f;
                return fId === currentUser._id;
            });

            followBtn.classList.remove('hidden');
            followBtn.className = `btn-follow ${isFollowing ? 'following' : ''}`;
            followBtn.innerHTML = isFollowing
                ? '<i class="fas fa-user-check"></i> <span>Following</span>'
                : '<i class="fas fa-user-plus"></i> <span>Follow</span>';

            // Remove old listener and add new one
            followBtn.replaceWith(followBtn.cloneNode(true));
            const newBtn = document.getElementById('follow-btn');
            newBtn.addEventListener('click', () => handleFollow(userId));
        }
    } catch (err) {
        console.error('Error loading user profile:', err);
        document.getElementById('modal-user-name').textContent = 'Error loading profile';
    }
}

function closeUserModal() {
    userModalOverlay.classList.add('hidden');
    document.body.style.overflow = '';
}

async function handleFollow(userId) {
    if (!currentUser) return;

    try {
        const res = await fetch(`${API_URL}/users/${userId}/follow`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${currentUser.token}`
            }
        });

        if (res.ok) {
            const data = await res.json();
            showToast(data.message);
            // Refresh the modal to show updated state
            openUserProfile(userId);
        }
    } catch (err) {
        console.error('Error following/unfollowing user:', err);
        showToast('Error updating follow status');
    }
}

// ========== Start App ==========
init();
