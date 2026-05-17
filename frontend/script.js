const API_BASE = 'http://localhost:5000/api';
let authToken = '';
let verificationLogs = [];

const output = document.getElementById('output');
const tokenStatus = document.getElementById('tokenStatus');
const logsContainer = document.getElementById('logsContainer');
const logCount = document.getElementById('logCount');
const clearLogsBtn = document.getElementById('clearLogsBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
let isGeneratingOtp = false;

const setTokenStatus = (isAuthenticated) => {
  if (!tokenStatus) return;

  if (isAuthenticated) {
    tokenStatus.textContent = 'Token: Verified';
    tokenStatus.classList.add('is-authenticated');
    return;
  }

  tokenStatus.textContent = 'Token: Not Verified';
  tokenStatus.classList.remove('is-authenticated');
};

const showOutput = (data) => {
  if (!output) return;
  output.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
};

const addLog = (type, contact, details, status = 'success') => {
  if (!logsContainer || !logCount) return;

  const timestamp = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  verificationLogs.unshift({
    id: Date.now(),
    type,
    contact: contact || '-',
    details: details || 'No details',
    status,
    timestamp,
  });

  renderLogs();
};

const renderLogs = () => {
  if (!logsContainer || !logCount) return;

  if (verificationLogs.length === 0) {
    logsContainer.innerHTML = '<p class="text-secondary text-center py-4">No verifications yet. Start by generating an OTP.</p>';
    logCount.textContent = '0';
    return;
  }

  logCount.textContent = verificationLogs.length;

  logsContainer.innerHTML = verificationLogs
    .map((log) => {
      const typeEmoji = {
        'otp-generated': '📤',
        'otp-verified': '✅',
        'user-created': '👤',
        error: '❌',
      }[log.type] || '📝';

      const statusClass = log.status === 'success' ? 'log-success' : 'log-error';

      return `
        <div class="log-item ${statusClass}">
          <div class="log-header">
            <span class="log-type">${typeEmoji} ${log.type.replace('-', ' ').toUpperCase()}</span>
            <span class="log-time">${log.timestamp}</span>
          </div>
          <div class="log-details">
            <p class="log-contact"><strong>Contact:</strong> ${log.contact}</p>
            <p class="log-message">${log.details}</p>
          </div>
        </div>
      `;
    })
    .join('');
};

const request = async (url, options = {}) => {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

document.getElementById('generateForm')?.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (isGeneratingOtp) {
    return;
  }

  isGeneratingOtp = true;

  const generateForm = document.getElementById('generateForm');
  const contact = document.getElementById('contact').value;
  const submitButton = generateForm?.querySelector('button[type="submit"]');

  if (submitButton) {
    submitButton.disabled = true;
  }

  try {
    const data = await request(`${API_BASE}/auth/generate-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact }),
    });

    showOutput(data);
    addLog('otp-generated', contact, `OTP sent successfully. Expires in 5 minutes.`);
    generateForm.reset();
    document.getElementById('verifyContact').value = data?.data?.contact || contact;
  } catch (error) {
    showOutput(error.message);
    addLog('otp-generated', contact, `Failed: ${error.message}`, 'error');
  } finally {
    isGeneratingOtp = false;

    if (submitButton) {
      submitButton.disabled = false;
    }
  }
}); 

document.getElementById('verifyForm')?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const verifyForm = document.getElementById('verifyForm');

  const contact = document.getElementById('verifyContact').value;
  const otp = document.getElementById('otp').value;

  try {
    const data = await request(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact, otp }),
    });

    authToken = data.token;
    setTokenStatus(true);
    showOutput({ ...data, info: 'Token stored in memory for protected APIs.' });
    addLog('otp-verified', contact, `Successfully verified. Token received.`);
    verifyForm.reset();
  } catch (error) {
    showOutput(error.message);
    addLog('otp-verified', contact, `Verification failed: ${error.message}`, 'error');
  }
});

document.getElementById('fetchUsersBtn')?.addEventListener('click', async () => {
  try {
    const data = await request(`${API_BASE}/users`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    showOutput(data);
  } catch (error) {
    showOutput(error.message);
  }
});

document.getElementById('createUserForm')?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = {
    name: document.getElementById('name').value,
    contact: document.getElementById('userContact').value,
    contactType: document.getElementById('contactType').value,
  };

  try {
    const data = await request(`${API_BASE}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });

    showOutput(data);
    addLog('user-created', payload.contact, `User "${payload.name}" created successfully.`);
    document.getElementById('createUserForm').reset();
  } catch (error) {
    showOutput(error.message);
    addLog('user-created', payload.contact, `Failed: ${error.message}`, 'error');
  }
});

clearLogsBtn?.addEventListener('click', () => {
  showOutput('Ready.');
});

clearHistoryBtn?.addEventListener('click', () => {
  verificationLogs = [];
  renderLogs();
});

renderLogs();
