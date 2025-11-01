const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

let transporter;
let transporterError;
const MAX_SMTP_SEND_ATTEMPTS = 3;
const SMTP_RETRYABLE_CODES = new Set(['ECONNECTION', 'ETIMEDOUT', 'ECONNRESET', 'EPIPE', 'EPROTO', 'ESOCKET']);

const isRetryableSmtpError = (error) => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  if (error.code && SMTP_RETRYABLE_CODES.has(error.code)) {
    return true;
  }

  const message = String(error.message || '').toLowerCase();
  if (!message) {
    return false;
  }
  return (
    message.includes('connection closed unexpectedly') ||
    message.includes('lost connection') ||
    message.includes('unexpected message') ||
    message.includes('ssl routines')
  );
};

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

const collectMemberEmails = (registration) => {
  if (!registration || !Array.isArray(registration.members)) {
    return [];
  }
  return uniqueEmails(registration.members.map((member) => member?.email).filter(Boolean));
};

const parseDelayMs = (value, fallback = 0) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }
  return fallback;
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

const HERO_URL_FALLBACK = process.env.EMAIL_TEMPLATE_HERO_URL || 'https://construct2-0.vercel.app/construct-email-hero.png';
const HERO_PATH = process.env.EMAIL_TEMPLATE_HERO_PATH || path.join(process.cwd(), 'Construct Poster.png');
const LOGO_URL_FALLBACK = process.env.EMAIL_LOGO_URL || 'https://construct2-0.vercel.app/construct-logo.png';
const LOGO_PATH = process.env.EMAIL_LOGO_PATH || path.join(process.cwd(), 'construct-logo.png');

let heroAttachment;
try {
  if (fs.existsSync(HERO_PATH)) {
    heroAttachment = {
      filename: path.basename(HERO_PATH),
      path: HERO_PATH,
      cid: 'construct-hero-poster',
    };
  }
} catch (error) {
  console.warn('Poster lookup failed:', error.message);
}

let logoAttachment;
try {
  if (fs.existsSync(LOGO_PATH)) {
    logoAttachment = {
      filename: path.basename(LOGO_PATH),
      path: LOGO_PATH,
      cid: 'construct-logo-mark',
    };
  }
} catch (error) {
  console.warn('Logo lookup failed:', error.message);
}

const HERO_IMAGE_SRC = heroAttachment ? 'cid:construct-hero-poster' : HERO_URL_FALLBACK;
const LOGO_IMAGE_SRC = logoAttachment ? 'cid:construct-logo-mark' : LOGO_URL_FALLBACK;

const EMAIL_CONFIRMATION_DELAY_MS = parseDelayMs(process.env.EMAIL_CONFIRMATION_DELAY_MS, 0);
const EMAIL_SEND_DELAY_MS = parseDelayMs(process.env.EMAIL_SEND_DELAY_MS, 0);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const resetTransporter = () => {
  try {
    if (transporter && typeof transporter.close === 'function') {
      transporter.close();
    }
  } catch (closeError) {
    console.warn('Failed to close SMTP transporter cleanly:', closeError.message);
  } finally {
    transporter = null;
    transporterError = null;
  }
};

const sendMail = async (message, attempt = 1) => {
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

  const existing = Array.isArray(envelope.attachments) ? envelope.attachments : [];
  const attachmentsToAdd = [];

  if (heroAttachment && !existing.some((item) => item?.cid === heroAttachment.cid)) {
    attachmentsToAdd.push(heroAttachment);
  }

  if (logoAttachment && !existing.some((item) => item?.cid === logoAttachment.cid)) {
    attachmentsToAdd.push(logoAttachment);
  }

  envelope.attachments = attachmentsToAdd.length ? [...existing, ...attachmentsToAdd] : existing;

  try {
    return await mailer.sendMail(envelope);
  } catch (error) {
    if (attempt < MAX_SMTP_SEND_ATTEMPTS && isRetryableSmtpError(error)) {
      console.warn(`Email send attempt ${attempt} failed (${error.code || error.message}). Retrying...`);
      resetTransporter();
      await wait(300 * attempt);
      return sendMail(message, attempt + 1);
    }
    throw error;
  }
};

const BRAND_BG = '#020E3B';
const BRAND_CARD = '#FFFFFF';
const BRAND_BORDER = '#324BC4';
const BRAND_PRIMARY = '#0B3BFF';
const BRAND_ACCENT = '#FF982E';
const BRAND_TEXT = '#081133';
const BRAND_MUTED = '#415284';
const BRAND_NOTE = '#D1431A';
const BRAND_NOTE_BG = '#FFF4EA';
const HEADER_BG = '#061767';
const GLOBAL_STYLES = `
  @media only screen and (max-width: 520px) {
    .container { width: 100% !important; }
    .card { border-radius: 16px !important; }
    .header-padding { padding: 20px 24px !important; }
    .hero img { border-radius: 0 !important; }
    .section { padding: 0 24px 20px !important; }
    .hr { padding: 0 24px !important; }
    .footer { padding: 20px 24px !important; }
    .logo-cell img { width: 120px !important; }
  }
`;
const HERO_URL = HERO_IMAGE_SRC;

const EVENT_SUPPORT_EMAIL = process.env.EVENT_SUPPORT_EMAIL || 'construct@nstconstruct.xyz';
const EVENT_DETAILS_URL = process.env.EVENT_DETAILS_URL || 'https://nstconstruct.xyz/';
const EVENT_SOCIAL_FACEBOOK = process.env.EVENT_SOCIAL_FACEBOOK || '';
const EVENT_SOCIAL_TWITTER = process.env.EVENT_SOCIAL_TWITTER || '';

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const composeHtmlDocument = (body, title = 'CoNSTruct Hackathon 2025') => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <style type="text/css">
      body { margin: 0 !important; padding: 0 !important; background: ${BRAND_BG}; }
      ${GLOBAL_STYLES}
    </style>
  </head>
  ${body}
</html>`;

const formatMembersInline = (members = []) => {
  if (!Array.isArray(members) || members.length === 0) {
    return 'No additional teammates submitted';
  }
  return members.map((member) => member?.name || 'Unnamed teammate').join(', ');
};

const formatMembersList = (members = []) => {
  if (!Array.isArray(members) || members.length === 0) {
    return '<li>No additional teammates submitted.</li>';
  }
  return members
    .map((member) => `<li style="margin-bottom:6px;">${escapeHtml(member?.name || 'Unnamed teammate')}</li>`)
    .join('');
};

const renderHorizontalRule = () =>
  `<tr><td class="hr" style="padding:0 40px;"><div style="height:1px;background:${BRAND_BORDER};opacity:0.35;margin:24px 0;"></div></td></tr>`;

const renderSection = (heading, content) => `
  <tr>
    <td class="section" style="padding:0 40px 24px;">
      <h2 style="margin:0 0 12px;font-size:20px;color:${BRAND_TEXT};">${escapeHtml(heading)}</h2>
      ${content}
    </td>
  </tr>
`;

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
    registration.members
      .map((member, index) => `  ${index + 1}. ${member?.name || 'Unnamed'} <${member?.email || 'email missing'}>`)
      .join('\n'),
    '',
    `Submitted at: ${registration.submittedAt || new Date().toISOString()}`,
  ];

  return lines.join('\n');
};

const buildAdminHtml = (registration) => {
  const rosterList = registration.members
    .map(
      (member) =>
        `<li style="margin-bottom:6px;">${escapeHtml(member?.name || 'Unnamed teammate')}</li>`
    )
    .join('') || '<li>No additional teammates submitted.</li>';

  const sections = [
    renderSection(
      'Team details',
      `<p style="margin:0;font-size:15px;color:${BRAND_MUTED};line-height:1.6;">
        <strong>Team:</strong> ${escapeHtml(registration.teamName)}<br/>
        <strong>Team size:</strong> ${escapeHtml(String(registration.teamSize))}<br/>
        <strong>Campus:</strong> ${escapeHtml(registration.campus)}<br/>
        <strong>Batch:</strong> ${escapeHtml(registration.batch)}<br/>
        <strong>Submitted at:</strong> ${escapeHtml(registration.submittedAt || new Date().toISOString())}
      </p>`
    ),
    renderSection(
      'Lead contact',
      `<p style="margin:0;font-size:15px;color:${BRAND_MUTED};line-height:1.6;">
        <strong>${escapeHtml(registration.lead?.name || 'Unknown')}</strong><br/>
        <a href="mailto:${escapeHtml(registration.lead?.email || '')}" style="color:${BRAND_ACCENT};text-decoration:none;">${escapeHtml(
          registration.lead?.email || 'no-email'
        )}</a><br/>
        ${escapeHtml(registration.lead?.gender || 'Gender not specified')}
      </p>`
    ),
    renderSection('Teammates', `<ul style="margin:0;padding-left:18px;font-size:15px;color:${BRAND_MUTED};line-height:1.6;">${rosterList}</ul>`),
  ].join(renderHorizontalRule());

  return `
  <html lang="en">
    <body style="margin:0;padding:36px 0;background:${BRAND_BG};font-family:'Inter',Arial,sans-serif;color:${BRAND_TEXT};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <table role="presentation" width="680" cellpadding="0" cellspacing="0" style="max-width:680px;background:${BRAND_CARD};border-radius:20px;overflow:hidden;box-shadow:0 28px 60px rgba(3, 17, 78, 0.32);">
              <tr>
                <td><img src="${escapeHtml(HERO_URL)}" alt="CoNSTruct Hackathon" width="100%" style="display:block;width:100%;max-width:680px;border:0;"/></td>
              </tr>
              <tr>
                <td style="padding:32px 40px 12px;">
                  <h1 style="margin:0 0 12px;font-size:26px;color:${BRAND_TEXT};">New registration confirmed</h1>
                  <p style="margin:0;font-size:16px;color:${BRAND_MUTED};line-height:1.7;">
                    ${escapeHtml(registration.teamName)} is confirmed. Here’s the snapshot to keep your notes tidy.
                  </p>
                </td>
              </tr>
              ${sections}
              <tr>
                <td style="padding:24px 40px;background:${BRAND_NOTE_BG};border-top:1px solid ${BRAND_BORDER};font-size:14px;color:${BRAND_NOTE};">
                  Keep this email for reference. Let us know if any of the details need correction.
                </td>
              </tr>
              <tr>
                <td style="padding:24px 40px;background:#061045;font-size:13px;color:#e3e9ff;border-top:1px solid rgba(255,255,255,0.08);">
                  Need help? Email <a href="mailto:${escapeHtml(EVENT_SUPPORT_EMAIL)}" style="color:#ffd27f;text-decoration:none;">${escapeHtml(
                    EVENT_SUPPORT_EMAIL
                  )}</a>.
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

const buildLeadBody = (registration) => {
  const teamMembersInline = formatMembersInline(registration.members);

  const lines = [
    `Dear ${registration.teamName},`,
    '',
    'Congratulations! Your team is *officially registered for CoNSTruct Hackathon 2025*, the inter-NST hackathon where ideas turn into real products in just 30 days!',
    '',
    'Team Details:',
    `Team Name: ${registration.teamName} | Team Leader: ${registration.lead?.name || 'Not provided'} | Team Members: ${teamMembersInline} | Campus: ${registration.campus}`,
    'Please *review the details* and reply if any corrections are needed.',
    '',
    'What’s Next?',
    '*November 5: Problem Statement Reveal + Launch Session.*',
    'All problem statements will be announced and explained. *Attendance is compulsory* for all teams. Joining details will be shared via Slack and email.',
    '',
    'Hackathon Roadmap',
    'Weeks 1–2: Ideation to MVP - design thinking workshops, mentorship from The Product Folks & Emergent, and 50 Emergent AI credits to build faster.',
    'Weeks 3–4: Product Hunt Launch Sprint - pitch your MVP on Demo Day, gain real-world traction, and access exclusive mentorship for top teams.',
    '',
    '*Prize Pool: ₹50,000* + the chance to launch publicly and take your product further.',
    '',
    'You’re now part of a community building the next wave of innovation at NST. Get ready to ideate, prototype, and launch with purpose.',
    '',
    'Best,',
    'Team CoNSTruct',
    'NST Hackathon 2025',
    'https://www.nstconstruct.xyz/',
  ];

  return lines.join('\n');
};

const buildLeadHtml = (registration) => {
  const membersInline = formatMembersInline(registration.members);
  const socials = [
    EVENT_SOCIAL_FACEBOOK && `<a href="${escapeHtml(EVENT_SOCIAL_FACEBOOK)}" style="color:${BRAND_ACCENT};text-decoration:none;">Facebook</a>`,
    EVENT_SOCIAL_TWITTER && `<a href="${escapeHtml(EVENT_SOCIAL_TWITTER)}" style="color:${BRAND_ACCENT};text-decoration:none;">Twitter</a>`,
  ]
    .filter(Boolean)
    .join(' · ');

  const posterRow = `
    <tr>
      <td style="padding:24px 40px 0;">
        <img src="${escapeHtml(HERO_URL)}" alt="CoNSTruct Hackathon 2025 poster" width="100%" style="display:block;width:100%;max-width:520px;margin:0 auto;border:0;border-radius:18px;"/>
      </td>
    </tr>
  `;

  const sectionsHtml = [
    renderSection(
      'Team details',
      `<p style="margin:0;font-size:15px;color:${BRAND_MUTED};line-height:1.6;">
        <strong>Team Name:</strong> ${escapeHtml(registration.teamName)}<br/>
        <strong>Team Leader:</strong> ${escapeHtml(registration.lead?.name || 'Not provided')}<br/>
        <strong>Team Members:</strong> ${escapeHtml(membersInline)}<br/>
        <strong>Campus:</strong> ${escapeHtml(registration.campus)}
      </p>
      <p style="margin:12px 0 0;font-size:14px;color:${BRAND_MUTED};"><em>Please review the details and reply if anything needs correcting.</em></p>`
    ),
    posterRow,
    renderSection(
      'What’s next?',
      `<p style="margin:0;font-size:15px;color:${BRAND_MUTED};line-height:1.6;">
        <em>November 5: Problem Statement Reveal + Launch Session.</em><br/>
        All problem statements will be announced and explained. <em>Attendance is compulsory</em> for every team. Joining details will be shared via Slack and email.
      </p>`
    ),
    renderSection(
      'Hackathon roadmap',
      `<p style="margin:0;font-size:15px;color:${BRAND_MUTED};line-height:1.6;">
        <strong>Weeks 1–2: Ideation to MVP</strong><br/>
        Design thinking workshops, mentorship from The Product Folks & Emergent, and 50 Emergent AI credits to build faster.
      </p>
      <p style="margin:16px 0 0;font-size:15px;color:${BRAND_MUTED};line-height:1.6;">
        <strong>Weeks 3–4: Product Hunt Launch Sprint</strong><br/>
        Pitch your MVP on Demo Day, gain real-world traction, and access exclusive mentorship for top teams.
      </p>`
    ),
    renderSection(
      'Prize pool',
      `<p style="margin:0;font-size:15px;color:${BRAND_MUTED};line-height:1.6;">
        <strong>Prize Pool:</strong> ₹50,000 + the chance to launch publicly and take your product further.
      </p>`
    ),
  ].join('');

  const eventDetailsHref = (EVENT_DETAILS_URL || '').trim() || 'https://nstconstruct.xyz/';
  const eventDetailsLabel = eventDetailsHref.replace(/^https?:\/\//, '').replace(/\/$/, '');

  const body = `
  <body style="margin:0;padding:36px 0;background:${BRAND_BG};font-family:'Inter',Arial,sans-serif;color:${BRAND_TEXT};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table role="presentation" width="680" cellpadding="0" cellspacing="0" class="container card" style="width:100%;max-width:680px;background:${BRAND_CARD};border-radius:20px;overflow:hidden;box-shadow:0 28px 60px rgba(3, 17, 78, 0.32);">
            <tr>
              <td class="header-padding" style="padding:24px 36px;background:${HEADER_BG};">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td class="logo-cell" style="vertical-align:middle;" width="160">
                      <img src="${escapeHtml(LOGO_IMAGE_SRC)}" alt="CoNSTruct NST" width="140" style="display:block;width:140px;max-width:100%;height:auto;"/>
                    </td>
                    <td style="text-align:right;vertical-align:middle;">
                      <p style="margin:0;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;color:#c6d4ff;">CoNSTruct Hackathon 2025</p>
                      <p style="margin:4px 0 0;font-size:15px;color:#f1f5ff;">Idea → Product Hunt launch in 30 days</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="section" style="padding:32px 40px 12px;">
                <h1 style="margin:0 0 12px;font-size:26px;color:${BRAND_TEXT};">✅ You’re In! CoNSTruct Hackathon 2025</h1>
                <p style="margin:0;font-size:16px;color:${BRAND_MUTED};line-height:1.7;">
                  Congratulations! ${escapeHtml(
                    registration.teamName
                  )} is <strong>officially registered</strong> for CoNSTruct Hackathon 2025 — the inter-NST sprint where ideas become real products in 30 days.
                </p>
              </td>
            </tr>
            ${sectionsHtml}
            <tr>
              <td class="section footer" style="padding:24px 40px;">
                <p style="margin:0 0 12px;font-size:15px;color:${BRAND_MUTED};">
                  You’re now part of a community building the next wave of innovation at NST. Get ready to ideate, prototype, and launch with purpose.
                </p>
                <p style="margin:0;font-size:15px;color:${BRAND_MUTED};">
                  Need support? <a href="mailto:${escapeHtml(EVENT_SUPPORT_EMAIL)}" style="color:${BRAND_ACCENT};text-decoration:none;">${escapeHtml(
                    EVENT_SUPPORT_EMAIL
                  )}</a><br/>
                  Check event details → <a href="${escapeHtml(eventDetailsHref)}" style="color:${BRAND_ACCENT};text-decoration:none;">${escapeHtml(
                    eventDetailsLabel || eventDetailsHref
                  )}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td class="footer" style="padding:24px 40px;background:#061045;color:#e3e9ff;font-size:13px;text-align:center;border-top:1px solid rgba(255,255,255,0.08);">
                ${socials ? `Follow us: ${socials}<br/><br/>` : ''}
                Best regards,<br/>Team CoNSTruct
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>`;

  return composeHtmlDocument(body, '✅ Confirmation: You’re In! CoNSTruct Hackathon 2025');
};

const sendRegistrationConfirmation = async (registration) => {
  const shouldSend = toBool(process.env.EMAIL_SEND_CONFIRMATION, true);
  const leadEmail = registration?.lead?.email;

  if (!shouldSend || !leadEmail) {
    return null;
  }

  const memberCc = collectMemberEmails(registration);
  const cc = memberCc;

  if (EMAIL_SEND_DELAY_MS > 0) {
    await wait(EMAIL_SEND_DELAY_MS);
  }

  return sendMail({
    to: leadEmail,
    cc: cc.length ? cc : undefined,
    replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_FROM || process.env.SMTP_USERNAME || undefined,
    bcc: process.env.EMAIL_CONFIRMATION_BCC || undefined,
    subject: `✅ Confirmation: You’re In! CoNSTruct Hackathon 2025`,
    text: buildLeadBody(registration),
    html: buildLeadHtml(registration),
  });
};

const notifyTeamRegistration = (registration) => {
  if (!registration || typeof registration !== 'object') {
    return Promise.resolve();
  }

  if (EMAIL_CONFIRMATION_DELAY_MS > 0) {
    console.warn(
      'EMAIL_CONFIRMATION_DELAY_MS is set but delayed sending is not supported in this environment. Sending immediately instead.'
    );
  }

  return sendRegistrationConfirmation(registration).catch((error) => {
    console.error('Failed to send registration email', error);
    throw error;
  });
};

module.exports = {
  emailEnabled,
  notifyTeamRegistration,
  sendRegistrationConfirmation,
};
