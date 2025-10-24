const STORAGE_KEY = 'construct-admin-auth';

const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');
const loginForm = document.getElementById('admin-login-form');
const tokenInput = document.getElementById('admin-token');
const loginError = document.getElementById('login-error');
const statusEl = document.getElementById('admin-status');
const tableBody = document.getElementById('registrations-body');
const refreshBtn = document.getElementById('refresh-registrations');
const downloadBtn = document.getElementById('download-registrations');
const logoutBtn = document.getElementById('admin-logout');

let authHeader = null;
let cachedItems = [];

const DEFAULT_ADMIN_USERNAME = 'admin';

const encodeCredentials = (username, token) => {
  const pair = `${username}:${token}`;
  if (typeof TextEncoder === 'function') {
    const bytes = new TextEncoder().encode(pair);
    let binary = '';
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return `Basic ${btoa(binary)}`;
  }
  return `Basic ${btoa(unescape(encodeURIComponent(pair)))}`;
};

const saveAuth = (token) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token }));
};

const clearAuth = () => {
  authHeader = null;
  cachedItems = [];
  localStorage.removeItem(STORAGE_KEY);
};

const setView = (view) => {
  if (view === 'dashboard') {
    loginView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    dashboardView.focus?.();
  } else {
    dashboardView.classList.add('hidden');
    loginView.classList.remove('hidden');
  }
};

const renderRows = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    tableBody.innerHTML =
      '<tr><td colspan="4" style="padding: 20px; text-align: center; color: var(--muted);">No registrations yet.</td></tr>';
    return;
  }

  const rows = items
    .map((item) => {
      const leadName = item?.lead?.name || '—';
      const leadEmail = item?.lead?.email || '';
      const leadGender = item?.lead?.gender || '';
      const leadDetails = [leadName, leadEmail, leadGender].filter(Boolean).join('<br>');

      const membersList = Array.isArray(item.members) && item.members.length
        ? item.members
            .map((member) => {
              const parts = [member.name || '—', member.email || '', member.gender || ''];
              return parts.filter(Boolean).join(' • ');
            })
            .join('<br>')
        : '—';

      return `<tr>
        <td style="vertical-align: top;">
          <strong>${item.teamName || '—'}</strong><br>
          <span class="muted" style="font-size: 0.78rem;">Team size: ${item.teamSize || (item.members?.length ?? 0) + 1}</span>
        </td>
        <td style="vertical-align: top;">${leadDetails || '—'}</td>
        <td style="vertical-align: top; max-width: 360px;">${membersList}</td>
        <td style="vertical-align: top;">${item.submittedAt ? new Date(item.submittedAt).toLocaleString() : '—'}</td>
      </tr>`;
    })
    .join('');

  tableBody.innerHTML = rows;
};

const fetchRegistrations = async ({ announce = true } = {}) => {
  if (!authHeader) {
    setView('login');
    return;
  }

  if (announce) {
    statusEl.textContent = 'Refreshing registrations…';
    tableBody.innerHTML =
      '<tr><td colspan="4" style="padding: 20px; text-align: center; color: var(--muted);">Loading…</td></tr>';
  }

  try {
    const resp = await fetch('/api/registrations', {
      method: 'GET',
      headers: {
        Authorization: authHeader,
        Accept: 'application/json',
      },
      credentials: 'same-origin',
    });

    if (resp.status === 401 || resp.status === 403) {
      throw new Error('unauthorized');
    }

    if (!resp.ok) {
      throw new Error(`Server responded with ${resp.status}`);
    }

    const data = await resp.json();
    cachedItems = Array.isArray(data.items) ? data.items : [];
    renderRows(cachedItems);
    statusEl.textContent = `Showing ${cachedItems.length} registration${cachedItems.length === 1 ? '' : 's'}.`;
  } catch (error) {
    console.error('Failed to load registrations', error);
    if (error.message === 'unauthorized') {
      clearAuth();
      loginError.textContent = 'Access denied. Please check your username or token.';
      setView('login');
      tokenInput.focus();
      return;
    }
    statusEl.textContent = 'Failed to load registrations. Try refreshing.';
    tableBody.innerHTML =
      '<tr><td colspan="4" style="padding: 20px; text-align: center; color: var(--danger);">Error loading registrations.</td></tr>';
  }
};

const handleLogin = async (event) => {
  event.preventDefault();
  loginError.textContent = '';

  const token = tokenInput.value.trim();

  if (!token) {
    loginError.textContent = 'Provide the access token to continue.';
    return;
  }

  try {
    authHeader = encodeCredentials(DEFAULT_ADMIN_USERNAME, token);
  } catch (error) {
    loginError.textContent = 'Could not encode credentials. Try different characters.';
    return;
  }

  saveAuth(token);
  setView('dashboard');
  statusEl.textContent = 'Signing in…';
  await fetchRegistrations({ announce: false });
};

const downloadCsv = () => {
  if (!cachedItems.length) {
    statusEl.textContent = 'No registrations to export yet.';
    return;
  }

  const escapeCsv = (value) => {
    if (value == null) return '';
    const text = String(value).replace(/\r?\n|\r/g, ' ').trim();
    if (/[",]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const rows = [
    ['Team Name', 'Team Size', 'Lead Name', 'Lead Email', 'Lead Gender', 'Members'].map(escapeCsv).join(','),
    ...cachedItems.map((item) => {
      const memberSummary = Array.isArray(item.members)
        ? item.members
            .map((member) => {
              const pieces = [member.name || '—', member.email || '', member.gender || '']
                .filter(Boolean)
                .join(' / ');
              return pieces;
            })
            .join(' | ')
        : '';

      return [
        escapeCsv(item.teamName || ''),
        escapeCsv(item.teamSize || ''),
        escapeCsv(item?.lead?.name || ''),
        escapeCsv(item?.lead?.email || ''),
        escapeCsv(item?.lead?.gender || ''),
        escapeCsv(memberSummary),
      ].join(',');
    }),
  ].join('\n');

  const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const timestamp = new Date().toISOString().split('T')[0];
  const link = document.createElement('a');
  link.href = url;
  link.download = `construct-registrations-${timestamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  statusEl.textContent = `Exported ${cachedItems.length} record${cachedItems.length === 1 ? '' : 's'} to CSV.`;
};

const logout = () => {
  clearAuth();
  loginForm.reset();
  loginError.textContent = '';
  setView('login');
  tokenInput.focus();
};

loginForm.addEventListener('submit', handleLogin);
refreshBtn.addEventListener('click', () => fetchRegistrations({ announce: true }));
downloadBtn.addEventListener('click', downloadCsv);
logoutBtn.addEventListener('click', logout);

const storedCredentials = localStorage.getItem(STORAGE_KEY);
if (storedCredentials) {
  try {
    const parsed = JSON.parse(storedCredentials);
    if (parsed?.token) {
      tokenInput.value = parsed.token;
      authHeader = encodeCredentials(DEFAULT_ADMIN_USERNAME, parsed.token);
      setView('dashboard');
      fetchRegistrations({ announce: false });
    }
  } catch (error) {
    console.warn('Failed to parse stored admin credentials', error);
    clearAuth();
  }
}
