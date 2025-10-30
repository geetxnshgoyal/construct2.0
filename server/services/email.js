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

const sendRegistrationAdminAlert = async (registration) => {
  const recipients = parseEmailList(process.env.EMAIL_ADMIN_RECIPIENTS);
  if (recipients.length === 0) {
    return null;
  }

  return sendMail({
    to: recipients,
    subject: `[CoNSTruct NST] New team registration: ${registration.teamName}`,
    text: buildAdminBody(registration),
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
    subject: 'CoNSTruct NST registration received',
    text: buildLeadBody(registration),
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
