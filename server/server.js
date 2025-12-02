const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');
const USERS_SUFFIX = '_users.json';
const ENV_VARIABLES = [
  { key: 'PORT', label: 'Server port' },
  { key: 'NODE_ENV', label: 'Node environment' },
  { key: 'DATABASE_URL', label: 'PostgreSQL connection URL (Railway)' },
  { key: 'PGHOST', label: 'Postgres host' },
  { key: 'PGPORT', label: 'Postgres port' },
  { key: 'PGUSER', label: 'Postgres user' },
  { key: 'PGPASSWORD', label: 'Postgres password' },
  { key: 'PGDATABASE', label: 'Postgres database' },
  { key: 'REDIS_URL', label: 'Redis connection URL (Railway)' },
  { key: 'REDIS_HOST', label: 'Redis host' },
  { key: 'REDIS_PORT', label: 'Redis port' },
  { key: 'REDIS_PASSWORD', label: 'Redis password' },
  { key: 'RAILWAY_ENVIRONMENT', label: 'Railway environment id' },
  { key: 'RAILWAY_ENVIRONMENT_NAME', label: 'Railway environment name' },
  { key: 'RAILWAY_PROJECT_ID', label: 'Railway project id' },
  { key: 'RAILWAY_SERVICE_NAME', label: 'Railway service name' },
  { key: 'RAILWAY_STATIC_URL', label: 'Railway static URL' },
];

fs.ensureDirSync(DATA_DIR);

app.use(cors());
app.use(express.json());

const getRoleFilePath = (role) => {
  const normalizedRole = (role || 'unknown').toLowerCase();
  return {
    normalizedRole,
    filePath: path.join(DATA_DIR, `${normalizedRole}${USERS_SUFFIX}`),
  };
};

const readUsersByRole = async (role) => {
  const { filePath } = getRoleFilePath(role);
  if (!(await fs.pathExists(filePath))) {
    return [];
  }
  try {
    const users = await fs.readJson(filePath);
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
};

const writeUsersByRole = async (role, users) => {
  const { filePath } = getRoleFilePath(role);
  await fs.writeJson(filePath, users, { spaces: 2 });
};

const sanitizeUser = (user) => {
  const { password, confirmPassword, ...safeUser } = user;
  return safeUser;
};

const findUserByEmail = async (email) => {
  const files = await fs.readdir(DATA_DIR).catch(() => []);
  for (const file of files) {
    if (!file.endsWith(USERS_SUFFIX)) continue;
    const role = file.replace(USERS_SUFFIX, '');
    const filePath = path.join(DATA_DIR, file);
    let users = [];
    try {
      users = await fs.readJson(filePath);
    } catch {
      users = [];
    }

    if (!Array.isArray(users)) continue;

    const user = users.find(
      (record) => record.email?.toLowerCase() === email?.toLowerCase()
    );
    if (user) {
      return { user, users, role, filePath };
    }
  }

  return { user: null, users: [], role: null, filePath: null };
};

const generateToken = () => {
  if (crypto.randomUUID) {
    return `mock-jwt-${crypto.randomUUID()}`;
  }
  return `mock-jwt-${crypto.randomBytes(16).toString('hex')}`;
};

const redactValue = (value = '') => {
  const normalized = value.trim();
  if (!normalized) return '';
  if (normalized.length <= 8) {
    return '*'.repeat(normalized.length || 4);
  }
  return `${normalized.slice(0, 4)}…${normalized.slice(-4)}`;
};

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const escapeAttribute = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

app.get('/', (req, res) => {
  res.send(`
    <h1>Ninofi API Server</h1>
    <p>Available endpoints:</p>
    <ul>
      <li>POST /api/auth/register - Register a new user</li>
      <li>POST /api/auth/login - Login with existing user</li>
      <li>POST /api/users - (Legacy) Save raw user data</li>
      <li>GET /api/users/:role - Fetch users for a role</li>
      <li>GET /env - View environment variables (Railway, Postgres, Redis)</li>
    </ul>
  `);
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/env', (_req, res) => {
  const envVars = ENV_VARIABLES.map(({ key, label }) => {
    const rawValue = process.env[key] || '';
    const hasValue = Boolean(rawValue);
    const redacted = hasValue ? redactValue(rawValue) : 'not set';
    return {
      key,
      label,
      rawValue,
      hasValue,
      redacted,
    };
  });

  const tableRows = envVars
    .map(
      ({ key, label, rawValue, hasValue, redacted }) => `
      <tr>
        <td>
          <div class="label">${escapeHtml(label || 'Environment variable')}</div>
          <div class="key">${escapeHtml(key)}</div>
        </td>
        <td>
          <code
            class="env-value${hasValue ? '' : ' empty'}"
            data-full="${escapeAttribute(rawValue)}"
            data-redacted="${escapeAttribute(redacted)}"
            data-has-value="${hasValue}"
          >
            ${escapeHtml(redacted)}
          </code>
        </td>
      </tr>`
    )
    .join('');

  res.send(`<!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Ninofi Env Vars</title>
      <style>
        :root {
          color-scheme: light;
          font-family: "SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace;
        }
        body {
          margin: 0;
          padding: 32px;
          background: #0f172a;
          color: #e2e8f0;
        }
        .page {
          max-width: 900px;
          margin: 0 auto;
        }
        h1 {
          margin: 0 0 12px;
          font-size: 28px;
          letter-spacing: -0.02em;
        }
        p.lead {
          margin: 0 0 20px;
          color: #cbd5e1;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          background: #0b1224;
          border: 1px solid #1f2937;
          border-radius: 12px;
          overflow: hidden;
        }
        th, td {
          padding: 14px 16px;
          text-align: left;
          border-bottom: 1px solid #1f2937;
        }
        th {
          background: #11182d;
          color: #94a3b8;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        tr:last-child td {
          border-bottom: none;
        }
        .label {
          font-weight: 600;
          color: #e2e8f0;
        }
        .key {
          color: #94a3b8;
          font-size: 12px;
          margin-top: 4px;
        }
        code {
          display: inline-block;
          padding: 6px 8px;
          background: #0f172a;
          border-radius: 8px;
          color: #cbd5e1;
          border: 1px solid #1e293b;
          min-width: 220px;
        }
        code.empty {
          color: #94a3b8;
        }
        .actions {
          margin: 0 0 16px;
          display: flex;
          gap: 10px;
        }
        button {
          border: 1px solid #1d4ed8;
          background: #1d4ed8;
          color: white;
          padding: 10px 14px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
        }
        button:hover {
          background: #1e3fa3;
        }
        .hint {
          color: #94a3b8;
          font-size: 12px;
          margin-top: 6px;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <h1>Environment variables</h1>
        <p class="lead">Railway stack (server, Postgres, Redis) env vars that this service can read.</p>
        <div class="actions">
          <button id="toggle-values">Show full values</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Variable</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <p class="hint">Values are redacted by default; click the button to reveal.</p>
      </div>
      <script>
        (function() {
          const toggle = document.getElementById('toggle-values');
          const values = Array.from(document.querySelectorAll('.env-value'));
          let showFull = false;

          const render = () => {
            values.forEach((el) => {
              const hasValue = el.dataset.hasValue === 'true';
              if (!hasValue) return;
              el.textContent = showFull ? (el.dataset.full || '') : (el.dataset.redacted || '');
            });
            toggle.textContent = showFull ? 'Hide values' : 'Show full values';
          };

          toggle?.addEventListener('click', () => {
            showFull = !showFull;
            render();
          });

          render();
        })();
      </script>
    </body>
  </html>`);
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, password, role, phone } = req.body || {};

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser.user) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const newUser = {
      id: Date.now().toString(),
      fullName,
      email,
      phone: phone || '',
      role: role.toLowerCase(),
      password,
      createdAt: new Date().toISOString(),
    };

    const users = await readUsersByRole(role);
    users.push(newUser);
    await writeUsersByRole(role, users);

    return res.status(201).json({
      user: sanitizeUser(newUser),
      token: generateToken(),
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ message: 'Failed to register user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const { user } = await findUserByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.json({
      user: sanitizeUser(user),
      token: generateToken(),
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({ message: 'Failed to login' });
  }
});

// Legacy endpoints retained for compatibility
app.post('/api/users', async (req, res) => {
  try {
    const userData = req.body;
    const role = userData.role || 'unknown';
    const users = await readUsersByRole(role);
    users.push(userData);
    await writeUsersByRole(role, users);
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).json({ success: false, error: 'Failed to save user data' });
  }
});

app.get('/api/users/:role', async (req, res) => {
  try {
    const { role } = req.params;
    const users = await readUsersByRole(role);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
