const nodemailer = require('nodemailer');

let transporter;
let transporterError;

const toBool = (value, defaultValue = false) => {
  if (typeof value === 'undefined' || value === null || value === '') {
    return defaultValue;
  }
  const normalized = String(value).trim().toLowerCase();
  return ['1', 'true', 'yes', 'on'].includes(normalized);
};

const parseEmailList = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const uniqueEmails = (list = []) => Array.from(new Set(list.filter(Boolean)));

const collectTeamEmails = (registration) => {
  const emails = [];
  if (registration?.lead?.email) {
    emails.push(registration.lead.email);
  }
  if (Array.isArray(registration?.members)) {
    registration.members.forEach((member) => {
      if (member?.email) {
        emails.push(member.email);
      }
    });
  }
  return uniqueEmails(emails);
};

const buildTransporter = () => {
  if (transporter || transporterError) {
    return transporter;
  }

  const host = process.env.SMTP_HOST;
  const port = Number.parseInt(process.env.SMTP_PORT || '587', 10);
  const username = process.env.SMTP_USERNAME;
  const password = process.env.SMTP_PASSWORD;
  const secure = toBool(process.env.SMTP_SECURE, false);

  if (!host || !username || !password) {
    transporterError = new Error('SMTP configuration incomplete. Provide SMTP_HOST, SMTP_USERNAME, and SMTP_PASSWORD.');
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host,
      port: Number.isFinite(port) ? port : 587,
      secure,
      auth: {
        user: username,
        pass: password,
      },
    });
  } catch (error) {
    transporterError = error;
    return null;
  }

  return transporter;
};

const getTransporterOrNull = () => buildTransporter();

const emailEnabled = () => Boolean(getTransporterOrNull());

const defaultFromAddress = () => process.env.EMAIL_FROM || process.env.SMTP_USERNAME || 'no-reply@example.com';

const sendMail = async (message) => {
  const mailer = getTransporterOrNull();

  if (!mailer) {
    const reason = transporterError ? transporterError.message : 'Email transport is not configured.';
    console.warn(`Skipping email send: ${reason}`);
    return { skipped: true, error: transporterError || null };
  }

  const envelope = Object.assign(
    {
      from: defaultFromAddress(),
    },
    message
  );

  return mailer.sendMail(envelope);
};

const formatMembers = (members = []) => {
  if (!Array.isArray(members) || members.length === 0) {
    return 'No additional teammates submitted.';
  }

  return members
    .map((member, index) => {
      const name = member?.name || 'Unnamed teammate';
      const email = member?.email ? `<${member.email}>` : '<email missing>';
      const gender = member?.gender || 'Gender not specified';
      return `${index + 1}. ${name} ${email} — ${gender}`;
    })
    .join('\n');
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatMembersHtml = (members = []) => {
  if (!Array.isArray(members) || members.length === 0) {
    return '<li>No additional teammates submitted.</li>';
  }

  return members
    .map((member) => {
      const name = escapeHtml(member?.name || 'Unnamed teammate');
      const email = member?.email ? escapeHtml(member.email) : 'email missing';
      const gender = escapeHtml(member?.gender || 'Gender not specified');
      return `<li><strong>${name}</strong> <span style="color:#475569;">&lt;${email}&gt;</span> · <em style="color:#64748b;">${gender}</em></li>`;
    })
    .join('');
};

const formatMembersNames = (members = []) => {
  if (!Array.isArray(members) || members.length === 0) {
    return '<li>No additional teammates submitted.</li>';
  }

  return members.map((member) => `<li>${escapeHtml(member?.name || 'Unnamed teammate')}</li>`).join('');
};

const BRAND_SHADOW = '0 24px 55px rgba(15, 23, 42, 0.14)';
const BRAND_BORDER = '#e2e8f0';
const BRAND_BG = '#eef2ff';
const BRAND_CARD = '#ffffff';
const BRAND_ACCENT = '#2563eb';
const BRAND_TEXT = '#0f172a';
const BRAND_MUTED = '#475569';
const BRAND_LABEL = '#94a3b8';
const WINDOW_DOT_RED = '#ef4444';
const WINDOW_DOT_YELLOW = '#f59e0b';
const WINDOW_DOT_GREEN = '#22c55e';

const EVENT_NAME = process.env.EVENT_NAME || 'CoNSTruct NST 2025';
const EVENT_START_DATE = process.env.EVENT_START_DATE || 'May 24, 2025';
const EVENT_END_DATE = process.env.EVENT_END_DATE || 'May 26, 2025';
const EVENT_LOCATION = process.env.EVENT_LOCATION || 'Hybrid · NST campuses & online';
const EVENT_DETAILS_URL = process.env.EVENT_DETAILS_URL || 'https://nstconstruct.xyz/system';
const EVENT_SUPPORT_EMAIL = process.env.EVENT_SUPPORT_EMAIL || 'construct@nstconstruct.xyz';
const EVENT_SOCIAL_FACEBOOK = process.env.EVENT_SOCIAL_FACEBOOK || '';
const EVENT_SOCIAL_TWITTER = process.env.EVENT_SOCIAL_TWITTER || '';
const HERO_URL = process.env.EMAIL_TEMPLATE_HERO_URL || 'https://construct2-0.vercel.app/og-image.png';

const renderWindowControls = () => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="padding:18px 24px;">
        <span style="display:inline-block;width:12px;height:12px;border-radius:999px;background:${WINDOW_DOT_RED};margin-right:8px;"></span>
        <span style="display:inline-block;width:12px;height:12px;border-radius:999px;background:${WINDOW_DOT_YELLOW};margin-right:8px;"></span>
        <span style="display:inline-block;width:12px;height:12px;border-radius:999px;background:${WINDOW_DOT_GREEN};"></span>
      </td>
      <td align="right" style="padding:18px 24px;font-size:12px;letter-spacing:1.6px;color:${BRAND_LABEL};text-transform:uppercase;">
        NST Mail Relay
      </td>
    </tr>
  </table>
`;

const renderSection = (title, content) => `
  <tr>
    <td style="padding:0 32px 28px 32px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:18px;border:1px solid #e2e8f0;">
        <tr>
          <td style="padding:22px 24px;">
            <h3 style="margin:0 0 14px;font-size:16px;text-transform:uppercase;letter-spacing:1.4px;color:${BRAND_LABEL};">${escapeHtml(
              title
            )}</h3>
            <div style="font-size:15px;color:${BRAND_MUTED};line-height:1.7;">${content}</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
`;

const renderTimeline = (items = []) =>
  items
    .map(
      (item, index) => `
      <div style="background:#ffffff;border-radius:14px;padding:14px 18px;border:1px solid ${BRAND_BORDER};margin-bottom:12px;">
        <div style="font-size:13px;font-weight:600;color:${BRAND_LABEL};letter-spacing:1.2px;text-transform:uppercase;margin-bottom:6px;">Step ${index + 1}</div>
        <div style="font-size:15px;color:${BRAND_TEXT};font-weight:600;margin-bottom:4px;">${escapeHtml(item.title)}</div>
        <p style="margin:0;font-size:14px;color:${BRAND_MUTED};line-height:1.6;">${escapeHtml(item.body)}</p>
      </div>`
    )
    .join('');

const renderCardShell = ({ preheader, subject, hero, introHtml, sectionsHtml, ctaLabel, ctaHref, footerHtml }) => {
  const safePreheader = escapeHtml(preheader || '');
  const safeSubject = escapeHtml(subject || '');

  return `
  <html lang="en">
    <body style="margin:0;padding:0;background:${BRAND_BG};font-family:'Inter',Arial,sans-serif;color:${BRAND_TEXT};">
      <span style="display:none!important;visibility:hidden;mso-hide:all;font-size:1px;color:${BRAND_BG};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${safePreheader}</span>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:36px 0;background:${BRAND_BG};">
        <tr>
          <td align="center">
            <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="width:640px;max-width:640px;border-radius:28px;background:${BRAND_CARD};border:1px solid ${BRAND_BORDER};box-shadow:${BRAND_SHADOW};overflow:hidden;">
              <tr>
                <td style="background:${BRAND_CARD};">${renderWindowControls()}</td>
              </tr>
              <tr>
                <td style="padding:0 32px 32px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_CARD};border-radius:22px;">
                    ${
                      hero
                        ? `<tr>
                            <td align="center" style="padding:0 0 12px;">
                              <img src="${escapeHtml(hero)}" alt="${safeSubject}" width="560" style="width:100%;max-width:560px;border-radius:18px;display:block;border:1px solid ${BRAND_BORDER};"/>
                            </td>
                          </tr>`
                        : ''
                    }
                    <tr>
                      <td style="padding:24px 0;">
                        ${introHtml}
                      </td>
                    </tr>
                    ${sectionsHtml}
                    ${
                      ctaLabel && ctaHref
                        ? `<tr>
                            <td align="center" style="padding:12px 0 8px;">
                              <a href="${escapeHtml(
                                ctaHref
                              )}" style="display:inline-block;padding:14px 28px;background:${BRAND_ACCENT};color:#f8fafc;text-decoration:none;font-weight:600;border-radius:14px;box-shadow:0 12px 30px rgba(37, 99, 235, 0.4);">
                                ${escapeHtml(ctaLabel)}
                              </a>
                            </td>
                          </tr>`
                        : ''
                    }
                    ${
                      footerHtml
                        ? `<tr>
                            <td style="padding-top:24px;font-size:13px;color:${BRAND_MUTED};line-height:1.7;border-top:1px dashed ${BRAND_BORDER};padding-top:20px;">${footerHtml}</td>
                          </tr>`
                        : ''
                    }
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
};

const buildAdminBody = (registration) => {
  const lines = [
    `Team name: ${registration.teamName}`,
    `Team size: ${registration.teamSize}`,
    `Campus: ${registration.campus}`,
    `Batch: ${registration.batch}`,
    '',
    'Team lead:',
    `- ${registration.lead?.name || 'Unknown'} <${registration.lead?.email || 'no-email'}> — ${registration.lead?.gender || 'Gender not specified'}`,
    '',
    'Teammates:',
    formatMembers(registration.members),
    '',
    `Submitted at: ${registration.submittedAt || new Date().toISOString()}`,
  ];

  return lines.join('\n');
};

const buildAdminHtml = (registration) => {
  const submittedAt = registration.submittedAt || new Date().toISOString();
  const intro = `
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:${BRAND_TEXT};">New pod incoming</h1>
    <p style="margin:0 0 16px;font-size:16px;color:${BRAND_MUTED};line-height:1.7;">
      <strong>${escapeHtml(registration.teamName)}</strong> just confirmed from <strong>${escapeHtml(
    registration.campus
  )}</strong>. Snapshot the roster below and push the onboarding play.
    </p>
    <p style="margin:0;font-size:13px;letter-spacing:1.4px;text-transform:uppercase;color:${BRAND_LABEL};">${escapeHtml(
      submittedAt
    )}</p>
  `;

  const sections =
    renderSection(
      'Team dossier',
      `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:${BRAND_TEXT};">
          <tr>
            <td style="padding:6px 0;"><strong>Team</strong></td>
            <td style="padding:6px 0;color:${BRAND_MUTED};">${escapeHtml(registration.teamName)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;"><strong>Campus</strong></td>
            <td style="padding:6px 0;color:${BRAND_MUTED};">${escapeHtml(registration.campus)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;"><strong>Batch</strong></td>
            <td style="padding:6px 0;color:${BRAND_MUTED};">${escapeHtml(registration.batch)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;"><strong>Team size</strong></td>
            <td style="padding:6px 0;color:${BRAND_MUTED};">${escapeHtml(registration.teamSize)}</td>
          </tr>
        </table>
      `
    ) +
    renderSection(
      'Lead contact',
      `
        <p style="margin:0;font-size:15px;color:${BRAND_TEXT};font-weight:600;">${escapeHtml(
          registration.lead?.name || 'Unknown'
        )}</p>
        <p style="margin:6px 0 0;font-size:14px;"><a href="mailto:${escapeHtml(
          registration.lead?.email || ''
        )}" style="color:${BRAND_ACCENT};text-decoration:none;">${escapeHtml(registration.lead?.email || 'no-email')}</a></p>
        <p style="margin:6px 0 0;font-size:13px;color:${BRAND_LABEL};">${escapeHtml(
          registration.lead?.gender || 'Gender not specified'
        )}</p>
      `
    ) +
    renderSection('Teammates', `<ul style="margin:0;padding-left:18px;">${formatMembersHtml(registration.members)}</ul>`) +
    renderSection(
      'Ops checklist',
      renderTimeline([
        { title: 'Mirror roster to Firebase / Notion', body: 'Ensure no duplicate emails across pods before scheduling workspace invites.' },
        { title: 'Announce in Mentor Relay', body: 'Drop the lead’s contact in the mentor channel so onboarding buddies can reach out.' },
        { title: 'Kickoff pack dispatch', body: 'Send workspace invite + onboarding deck within 24h. CC support for audit trail.' },
      ])
    );

  const footer = `Reply directly to reach ${escapeHtml(
    registration.lead?.name || 'the team lead'
  )}. Need to flag an issue? Ping the ops desk on <a href="mailto:${escapeHtml(EVENT_SUPPORT_EMAIL)}" style="color:${BRAND_ACCENT};text-decoration:none;">${escapeHtml(
    EVENT_SUPPORT_EMAIL
  )}</a>.`;

  return renderCardShell({
    preheader: `New team registration: ${registration.teamName}`,
    subject: `[CoNSTruct NST] New team registration: ${registration.teamName}`,
    hero: HERO_URL,
    introHtml: intro,
    sectionsHtml: sections,
    ctaLabel: 'Open Ops Console',
    ctaHref: EVENT_DETAILS_URL,
    footerHtml: footer,
  });
};

const buildLeadBody = (registration) => {
  const lines = [
    `Hi ${registration.lead?.name || 'there'},`,
    '',
    'Thanks for registering for CoNSTruct NST. We have received your team details:',
    '',
    `Team: ${registration.teamName}`,
    `Campus: ${registration.campus}`,
    `Batch: ${registration.batch}`,
    `Team size: ${registration.teamSize}`,
    '',
    'Teammates:',
    formatMembers(registration.members),
    '',
    'Our organizing team will review your submission and share next steps soon.',
    'If you have any questions, just reply to this email.',
    '',
    'Best of luck!',
    'CoNSTruct NST Organising Team',
  ];

  return lines.join('\n');
};

const buildLeadHtml = (registration) => {
  const leadName = escapeHtml(registration.lead?.name || 'there');
  const hero = HERO_URL;
  const intro = `
    <h1 style="margin:0 0 12px;font-size:28px;font-weight:700;color:${BRAND_TEXT};">Mission confirmed, ${leadName}!</h1>
    <p style="margin:0;font-size:16px;color:${BRAND_MUTED};line-height:1.7;">
      Your crew <strong>${escapeHtml(registration.teamName)}</strong> is officially queued for <strong>${escapeHtml(
    EVENT_NAME
  )}</strong>. Forward this to your pod so everyone is synced for launch.
    </p>
  `;

  const sections =
    renderSection(
      'Team dossier',
      `
        <p style="margin:0 0 8px;font-size:15px;color:${BRAND_MUTED};"><strong>Campus:</strong> ${escapeHtml(
          registration.campus
        )}</p>
        <p style="margin:0 0 8px;font-size:15px;color:${BRAND_MUTED};"><strong>Batch:</strong> ${escapeHtml(
          registration.batch
        )}</p>
        <p style="margin:0 0 8px;font-size:15px;color:${BRAND_MUTED};"><strong>Team size:</strong> ${escapeHtml(
          registration.teamSize
        )}</p>
        <p style="margin:0 0 6px;font-size:15px;color:${BRAND_MUTED};"><strong>Team lead:</strong> ${leadName}</p>
        <p style="margin:0 0 8px;font-size:15px;color:${BRAND_MUTED};"><strong>Teammates:</strong></p>
        <ul style="margin:0;padding-left:18px;color:${BRAND_MUTED};font-size:15px;line-height:1.7;">
          ${formatMembersNames(registration.members)}
        </ul>
      `
    ) +
    renderSection(
      'Important beats',
      `
        <p style="margin:0 0 10px;font-size:15px;color:${BRAND_MUTED};"><strong>Window:</strong> ${escapeHtml(
          EVENT_START_DATE
        )} – ${escapeHtml(EVENT_END_DATE)}</p>
        <p style="margin:0 0 10px;font-size:15px;color:${BRAND_MUTED};"><strong>Venue:</strong> ${escapeHtml(
          EVENT_LOCATION
        )}</p>
        <p style="margin:0;font-size:15px;color:${BRAND_MUTED};"><strong>Command centre:</strong> <a href="${escapeHtml(
          EVENT_DETAILS_URL
        )}" style="color:${BRAND_ACCENT};text-decoration:none;">${escapeHtml(EVENT_DETAILS_URL)}</a></p>
      `
    ) +
    renderSection(
      'Next checkpoints',
      renderTimeline([
        { title: 'Workspace invite', body: 'Watch your inbox within 48 hours for the Emergent workspace link.' },
        { title: 'Kickoff sync', body: 'Join the live strategy briefing to align on pods, tracks, and scoring.' },
        { title: 'Build sprint', body: 'Drop your first milestone before the sprint checkpoint to stay on the fast track.' },
      ])
    );

  const socials = [
    EVENT_SOCIAL_FACEBOOK && `<a href="${escapeHtml(EVENT_SOCIAL_FACEBOOK)}" style="color:${BRAND_ACCENT};text-decoration:none;">Facebook</a>`,
    EVENT_SOCIAL_TWITTER && `<a href="${escapeHtml(EVENT_SOCIAL_TWITTER)}" style="color:${BRAND_ACCENT};text-decoration:none;">Twitter</a>`,
  ]
    .filter(Boolean)
    .join(' · ');

  const footer = `
    Need anything? Reply to this email or ping us at <a href="mailto:${escapeHtml(EVENT_SUPPORT_EMAIL)}" style="color:${BRAND_ACCENT};text-decoration:none;">${escapeHtml(
    EVENT_SUPPORT_EMAIL
  )}</a>.
    ${socials ? `<br/><br/>Follow live updates: ${socials}` : ''}
  `;

  return renderCardShell({
    preheader: `${registration.teamName} is confirmed for ${EVENT_NAME}`,
    subject: `You're in! ${registration.teamName} @ ${EVENT_NAME}`,
    hero,
    introHtml: intro,
    sectionsHtml: sections,
    ctaLabel: 'View Event Details',
    ctaHref: EVENT_DETAILS_URL,
    footerHtml: footer,
  });
};

const sendRegistrationAdminAlert = async (registration) => {
  const to = parseEmailList(process.env.EMAIL_ADMIN_RECIPIENTS);
  const cc = parseEmailList(process.env.EMAIL_ADMIN_CC);
  const bcc = parseEmailList(process.env.EMAIL_ADMIN_BCC);
  if (to.length === 0 && cc.length === 0 && bcc.length === 0) {
    return null;
  }

  const teamEmails = collectTeamEmails(registration);

  return sendMail({
    to: uniqueEmails(to),
    cc: uniqueEmails([...cc, ...teamEmails]),
    bcc: uniqueEmails(bcc),
    replyTo: registration.lead?.email || process.env.EMAIL_REPLY_TO || undefined,
    subject: `[CoNSTruct NST] New team registration: ${registration.teamName}`,
    text: buildAdminBody(registration),
    html: buildAdminHtml(registration),
  });
};

const sendRegistrationConfirmation = async (registration) => {
  const shouldSend = toBool(process.env.EMAIL_SEND_CONFIRMATION, true);
  const leadEmail = registration?.lead?.email;

  if (!shouldSend || !leadEmail) {
    return null;
  }

  return sendMail({
    to: leadEmail,
    replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_FROM || process.env.SMTP_USERNAME || undefined,
    subject: 'CoNSTruct NST registration received',
    text: buildLeadBody(registration),
    html: buildLeadHtml(registration),
  });
};

const notifyTeamRegistration = async (registration) => {
  if (!registration || typeof registration !== 'object') {
    return;
  }

  const results = await Promise.allSettled([
    sendRegistrationAdminAlert(registration),
    sendRegistrationConfirmation(registration),
  ]);

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const channel = index === 0 ? 'admin alert' : 'lead confirmation';
      console.error(`Failed to send ${channel} email`, result.reason);
    }
  });
};

module.exports = {
  emailEnabled,
  notifyTeamRegistration,
};
