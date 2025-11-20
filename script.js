
const API_BASE = 'https://api.mail.tm';
let currentAccount = null;
let currentToken = null;
let emailCheckInterval = null;
let countdownInterval = null;
let countdown = 60;

// Show notification
function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'notification' + (isError ? ' error' : '');
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Generate random password
function generatePassword() {
    return Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
}

// Get available domains
async function getDomain() {
    try {
        const response = await fetch(`${API_BASE}/domains`);
        const data = await response.json();
        return data['hydra:member'][0].domain;
    } catch (error) {
        console.error('Error getting domain:', error);
        return null;
    }
}

// Create new email account
async function createAccount() {
    try {
        const domain = await getDomain();
        if (!domain) {
            throw new Error('Could not get domain');
        }

        const username = 'temp' + Math.random().toString(36).substring(2, 10);
        const email = `${username}@${domain}`;
        const password = generatePassword();

        // Create account
        const createResponse = await fetch(`${API_BASE}/accounts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                address: email,
                password: password
            })
        });

        if (!createResponse.ok) {
            throw new Error('Failed to create account');
        }

        // Login to get token
        const loginResponse = await fetch(`${API_BASE}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                address: email,
                password: password
            })
        });

        if (!loginResponse.ok) {
            throw new Error('Failed to login');
        }

        const loginData = await loginResponse.json();
        
        currentAccount = {
            email: email,
            password: password
        };
        currentToken = loginData.token;

        document.getElementById('emailAddress').value = email;
        
        // Save to localStorage
        localStorage.setItem('tempEmail', JSON.stringify({
            account: currentAccount,
            token: currentToken,
            timestamp: Date.now()
        }));

        showNotification('✅ Email tạm thời đã được tạo!');
        startEmailCheck();
        startCountdown();

    } catch (error) {
        console.error('Error creating account:', error);
        showNotification('❌ Lỗi tạo email. Đang thử lại...', true);
        setTimeout(createAccount, 2000);
    }
}

// Get messages
async function getMessages() {
    if (!currentToken) return;

    try {
        const response = await fetch(`${API_BASE}/messages`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to get messages');
        }

        const data = await response.json();
        displayMessages(data['hydra:member']);
        
    } catch (error) {
        console.error('Error getting messages:', error);
    }
}

// Display messages
function displayMessages(messages) {
    const emailList = document.getElementById('emailList');
    const emailCount = document.getElementById('emailCount');
    
    emailCount.textContent = messages.length;

    if (messages.length === 0) {
        emailList.innerHTML = `
            <div class="empty-state">
                <p>📭 Chưa có email nào</p>
                <p class="small-text">Email sẽ xuất hiện ở đây khi có người gửi</p>
            </div>
        `;
        return;
    }

    emailList.innerHTML = messages.map(msg => `
        <div class="email-item ${msg.seen ? '' : 'unread'}" data-id="${msg.id}">
            <div class="email-from">${msg.from.name || msg.from.address}</div>
            <div class="email-subject">${msg.subject || '(Không có tiêu đề)'}</div>
            <div class="email-preview">${msg.intro || ''}</div>
            <div class="email-date">${new Date(msg.createdAt).toLocaleString('vi-VN')}</div>
        </div>
    `).join('');

    // Add click handlers
    document.querySelectorAll('.email-item').forEach(item => {
        item.addEventListener('click', () => {
            const messageId = item.getAttribute('data-id');
            openEmail(messageId);
        });
    });
}

// Open email detail
async function openEmail(messageId) {
    try {
        const response = await fetch(`${API_BASE}/messages/${messageId}`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to get message');
        }

        const message = await response.json();
        
        document.getElementById('modalSubject').textContent = message.subject || '(Không có tiêu đề)';
        document.getElementById('modalFrom').textContent = message.from.address;
        document.getElementById('modalTo').textContent = message.to[0].address;
        document.getElementById('modalDate').textContent = new Date(message.createdAt).toLocaleString('vi-VN');
        
        const iframe = document.getElementById('modalBody');
        const htmlContent = message.html || message.text.replace(/\n/g, '<br>');
        iframe.srcdoc = htmlContent;

        document.getElementById('emailModal').style.display = 'block';
        
        // Mark as read
        await fetch(`${API_BASE}/messages/${messageId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/merge-patch+json'
            },
            body: JSON.stringify({ seen: true })
        });
        
        getMessages();

    } catch (error) {
        console.error('Error opening email:', error);
        showNotification('❌ Không thể mở email', true);
    }
}

// Start email check interval
function startEmailCheck() {
    if (emailCheckInterval) {
        clearInterval(emailCheckInterval);
    }
    
    getMessages();
    emailCheckInterval = setInterval(() => {
        getMessages();
    }, 5000);
}

// Start countdown
function startCountdown() {
    countdown = 60;
    document.getElementById('countdown').textContent = countdown;
    
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    countdownInterval = setInterval(() => {
        countdown--;
        document.getElementById('countdown').textContent = countdown;
        
        if (countdown <= 0) {
            getMessages();
            countdown = 60;
        }
    }, 1000);
}

// Copy email to clipboard
document.getElementById('copyBtn').addEventListener('click', () => {
    const emailInput = document.getElementById('emailAddress');
    emailInput.select();
    document.execCommand('copy');
    showNotification('📋 Email đã được sao chép!');
});

// Refresh email
document.getElementById('refreshBtn').addEventListener('click', () => {
    if (confirm('Bạn có chắc muốn tạo email mới? Email hiện tại sẽ bị xóa.')) {
        localStorage.removeItem('tempEmail');
        currentAccount = null;
        currentToken = null;
        document.getElementById('emailList').innerHTML = `
            <div class="empty-state">
                <p>📭 Chưa có email nào</p>
            </div>
        `;
        createAccount();
    }
});

// Refresh inbox
document.getElementById('refreshInbox').addEventListener('click', () => {
    document.getElementById('loadingIndicator').style.display = 'block';
    getMessages();
    setTimeout(() => {
        document.getElementById('loadingIndicator').style.display = 'none';
    }, 500);
});

// Close modal
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('emailModal').style.display = 'none';
});

window.addEventListener('click', (event) => {
    const modal = document.getElementById('emailModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Initialize
window.addEventListener('load', () => {
    // Try to restore previous session
    const saved = localStorage.getItem('tempEmail');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            // Check if session is less than 1 hour old
            if (Date.now() - data.timestamp < 3600000) {
                currentAccount = data.account;
                currentToken = data.token;
                document.getElementById('emailAddress').value = currentAccount.email;
                startEmailCheck();
                startCountdown();
                showNotification('✅ Phiên làm việc đã được khôi phục!');
                return;
            }
        } catch (error) {
            console.error('Error restoring session:', error);
        }
    }
    
    // Create new account
    createAccount();
});
