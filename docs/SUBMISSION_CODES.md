# Submission Access Code Workflow

This document explains how the submission portal access code system works and how to manage it.

## Overview

The submission portal uses a secure access code system where:
1. Each registered team gets a **unique 12-character access code** (e.g., `A3F7-KR2M-9PQ4`)
2. The code is **hashed** using SHA-256 and stored in `data/submission-access.json`
3. The **plain code** is sent to teams via email
4. Teams use their **lead email + access code** to unlock the submission portal
5. After validation, the session is cached in localStorage for convenience

## Files & Components

### Backend

- **`server/services/submissionAccessRegistry.js`** - Validates access codes
- **`server/middleware/submitAccess.js`** - Middleware to verify submission access
- **`server/services/email.js`** - Email templates including `sendSubmissionAccessCode()`
- **`data/submission-access.json`** - Hashed codes (committed to git)
- **`data/submission-codes-plain.json`** - Plain codes (NOT committed, auto-generated)

### Frontend

- **`client/src/pages/Submit.tsx`** - Submission portal with two-step unlock
  1. Enter lead email + access code → Verify
  2. Fill project details → Submit

### Scripts

- **`scripts/generate-submission-codes.js`** - Generate codes for all teams
- **`scripts/send-submission-codes.js`** - Email codes to teams

## Step-by-Step Workflow

### 1. Generate Access Codes

After registrations close, generate unique codes for all teams:

```bash
node scripts/generate-submission-codes.js
```

This will:
- Fetch all registered teams from Firebase
- Generate a unique 12-character code for each team
- Hash the codes and save to `data/submission-access.json`
- Save plain codes to `data/submission-codes-plain.json` (for emailing)
- Upload codes to Firebase `submissionAccessKeys` collection

**Options:**
```bash
# Regenerate codes for teams that already have them
node scripts/generate-submission-codes.js --update-existing
```

### 2. Review Generated Codes

Check the generated codes:

```bash
cat data/submission-codes-plain.json
```

Example output:
```json
{
  "team1@example.com": {
    "code": "A3F7-KR2M-9PQ4",
    "teamName": "Team Alpha",
    "leadEmail": "team1@example.com",
    "leadName": "John Doe"
  },
  ...
}
```

### 3. Send Codes to Teams

**⚠️ IMPORTANT: This requires explicit `--confirm` flag to prevent accidental sends!**

Test first with your own email:
```bash
# Safe - sends to YOUR email only
node scripts/send-submission-codes.js --test your-email@example.com
```

When ready (after getting permission), send to all teams:

```bash
# Without --confirm: Shows warning and exits
node scripts/send-submission-codes.js

# With --confirm: Actually sends emails
node scripts/send-submission-codes.js --confirm
```

**Options:**
```bash
# Test with a single email address (SAFE - won't send to actual teams)
node scripts/send-submission-codes.js --test your-email@example.com

# Send to a specific team only (requires --confirm)
node scripts/send-submission-codes.js --team-email lead@example.com --confirm
```

**Safety Features:**
- ✅ Requires explicit `--confirm` flag for real sends
- ✅ Shows clear warning before proceeding
- ✅ Test mode sends to your email only
- ✅ Rate limiting (1 second between emails)
- ✅ Detailed logging and error tracking

### 4. Teams Submit Projects

Teams visit the submission portal (e.g., `https://submit.nstconstruct.xyz`):

1. **Unlock step:**
   - Enter lead email (must match registration)
   - Enter access code from email
   - Click "Unlock submission form"

2. **Submit step:**
   - Fill in project details
   - Upload/link pitch deck, repo, demo
   - Click "Submit final project"

3. **Confirmation:**
   - Success message shown
   - Submission saved to Firebase `finalSubmissions` collection

## Security Features

### Access Code Generation
- **Cryptographically secure random codes** using `crypto.randomBytes()`
- **Excludes ambiguous characters** (I, O, 0, 1) to prevent confusion
- **Formatted for readability** (XXXX-XXXX-XXXX)

### Storage
- **Hashed storage:** Only SHA-256 hashes stored in git
- **Plain codes:** Kept in `data/submission-codes-plain.json` which is gitignored
- **Firebase backup:** Plain codes stored in Firebase for email distribution

### Validation
1. **Email verification:** Lead email must match registration
2. **Hash comparison:** Submitted code is hashed and compared
3. **Session caching:** Hash stored in localStorage (not plain code)
4. **One submission per team:** Enforced by backend

### Rate Limiting
- `submissionGuard` middleware prevents spam
- Max 5 requests per hour per IP
- Min 60 seconds between requests

## API Endpoints

### Verify Access Code
```http
POST /api/final-submissions/access
Content-Type: application/json

{
  "leadEmail": "team@example.com",
  "accessCode": "A3F7-KR2M-9PQ4"
}
```

**Response (Success):**
```json
{
  "ok": true,
  "teamName": "Team Alpha",
  "leadEmail": "team@example.com",
  "accessCodeHash": "c6b3491f15b3f66f30c82b87431e60114de8abe2e423cb5fdb5ae856b6f64279"
}
```

### Submit Project
```http
POST /api/final-submissions
Content-Type: application/json

{
  "projectName": "My Awesome Project",
  "leadEmail": "team@example.com",
  "accessCodeHash": "c6b3491...",
  "deckUrl": "https://...",
  "repoUrl": "https://github.com/...",
  "demoUrl": "https://...",
  "documentationUrl": "https://...",
  "notes": "Additional context"
}
```

## Environment Variables

Add to `.env`:

```bash
# Submission portal
SUBMISSION_CLOSED=false
SUBMISSION_OPEN=true
SUBMISSION_URL=https://submit.nstconstruct.xyz
VITE_SUBMIT_DEADLINE="December 5, 2025"
VITE_SUBMIT_SUPPORT_EMAIL=support@nstconstruct.xyz

# Rate limiting
SUBMISSION_WINDOW_MS=3600000          # 1 hour
SUBMISSION_MAX_PER_WINDOW=5           # 5 attempts per hour
SUBMISSION_MIN_INTERVAL_MS=60000      # 1 minute between attempts
```

## Troubleshooting

### Code not working for a team
1. Check if code exists: `cat data/submission-codes-plain.json | grep "team@example.com"`
2. Verify hash matches: Compare hash in `submission-access.json`
3. Regenerate for that team: Delete entry and run generator
4. Manually add to Firebase: Use Firebase console

### Email not received
1. Check SMTP logs in terminal
2. Verify email in spam folder
3. Resend to specific team: `node scripts/send-submission-codes.js --team-email team@example.com`

### Lost plain codes file
1. If you have Firebase access, download from `submissionAccessKeys` collection
2. Otherwise, you'll need to regenerate (existing teams will get new codes)

### Need to reset a team's access
1. Generate new code manually
2. Update both JSON files
3. Update Firebase
4. Resend email to that team

## Best Practices

✅ **Generate codes after registrations close**  
✅ **Test with `--test` flag first**  
✅ **Backup `submission-codes-plain.json` securely**  
✅ **Monitor Firebase for submissions**  
✅ **Keep SMTP credentials secure**  
✅ **Rate limit to prevent abuse**  

❌ **Never commit plain codes to git**  
❌ **Don't share access codes publicly**  
❌ **Don't regenerate after teams have received codes**  

## Manual Code Generation (Emergency)

If you need to manually create a code for one team:

```javascript
const crypto = require('crypto');

// Generate code
const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const bytes = crypto.randomBytes(12);
let code = '';
for (let i = 0; i < 12; i++) {
  code += characters[bytes[i] % characters.length];
}
const formattedCode = code.match(/.{1,4}/g).join('-');

// Hash it
const hash = crypto.createHash('sha256').update(formattedCode).digest('hex');

console.log('Code:', formattedCode);
console.log('Hash:', hash);

// Add to data/submission-access.json and submission-codes-plain.json
```

## Support

For issues or questions about the submission system:
- Email: saurabhkumar@newtonschool.co
- Check Firebase logs for submission errors
- Review server logs for validation issues
