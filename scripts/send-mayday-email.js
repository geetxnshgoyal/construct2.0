#!/usr/bin/env node

const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });

// Ensure the organisers receive the admin alert copy.
process.env.EMAIL_ADMIN_RECIPIENTS = ['saurabhkumar@newtonschool.co', 'goyalgeetansh@gmail.com']
  .filter(Boolean)
  .join(',');

const { notifyTeamRegistration } = require('../server/services/email');

const registration = {
  teamName: 'MayDay',
  teamSize: 5,
  campus: 'NST-Svyasa',
  batch: 'Batch 2025',
  lead: {
    name: 'Geetansh',
    email: '2102508748@svyasa-sas.edu.in',
    gender: 'Male',
  },
  members: [
    {
      slot: 1,
      name: 'Divya Yadav',
      email: '2102508743@svyasa-sas.edu.in',
      gender: 'Female',
    },
    {
      slot: 2,
      name: 'Avanish Singh Sikarwar',
      email: '2102508723@svyasa-sas.edu.in',
      gender: 'Male',
    },
    {
      slot: 3,
      name: 'Sanskar Bansal',
      email: '2102508800@svyasa-sas.edu.in',
      gender: 'Male',
    },
    {
      slot: 4,
      name: 'Ravi Sharma',
      email: '2102508788@svyasa-sas.edu.in',
      gender: 'Male',
    },
  ],
  emails: [
    '2102508748@svyasa-sas.edu.in',
    '2102508743@svyasa-sas.edu.in',
    '2102508723@svyasa-sas.edu.in',
    '2102508800@svyasa-sas.edu.in',
    '2102508788@svyasa-sas.edu.in',
  ],
  submittedAt: '2025-10-30T19:16:59.000Z',
};

notifyTeamRegistration(registration)
  .then(() => {
    console.log('MayDay registration email dispatched.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to send MayDay registration email:', error);
    process.exit(1);
  });
