# Submission Portal - Quick Reference

## 🚀 Quick Start

### 1. Generate Codes for All Teams
```bash
node scripts/generate-submission-codes.js
```

### 2. Test Email Template (SAFE - sends to your email only)
```bash
node scripts/send-submission-codes.js --test your-email@example.com
```

### 3. Send Codes to All Teams (REQUIRES --confirm flag)
```bash
# This will show a safety warning and exit
node scripts/send-submission-codes.js

# To actually send, you MUST add --confirm
node scripts/send-submission-codes.js --confirm
```

⚠️ **IMPORTANT:** Email sending requires explicit `--confirm` flag to prevent accidents!

---

## 📋 Common Commands

### Generate & Email
```bash
# Step 1: Generate codes (safe, no emails sent)
node scripts/generate-submission-codes.js

# Step 2: Test email template to YOUR email (safe)
node scripts/send-submission-codes.js --test your-email@example.com

# Step 3: Review codes before sending
cat data/submission-codes-plain.json

# Step 4: Send to all teams (MUST use --confirm)
node scripts/send-submission-codes.js --confirm

# Send to single team (MUST use --confirm)
node scripts/send-submission-codes.js --team-email team@example.com --confirm
```

### Individual Team Management
```bash
# Show a team's code
node scripts/manage-submission-code.js show team@example.com

# Generate code for one team
node scripts/manage-submission-code.js generate team@example.com "Team Name"

# Verify a code
node scripts/manage-submission-code.js verify team@example.com ABCD-EFGH-IJKL

# Reset a team's code
node scripts/manage-submission-code.js reset team@example.com
```

### Testing
```bash
# Run tests
node scripts/test-submission-codes.js
```

---

## 🔐 Access Code Format

- **Length:** 12 characters + 2 hyphens = 14 total
- **Format:** `XXXX-XXXX-XXXX`
- **Example:** `A3F7-KR2M-9PQ4`
- **Characters:** `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (no I, O, 0, 1)

---

## 📁 File Locations

| File | Purpose | Git Status |
|------|---------|------------|
| `data/submission-access.json` | Hashed codes | ✅ Committed |
| `data/submission-codes-plain.json` | Plain codes | 🚫 Gitignored |
| `scripts/generate-submission-codes.js` | Generator | ✅ Committed |
| `scripts/send-submission-codes.js` | Email sender | ✅ Committed |
| `scripts/manage-submission-code.js` | Individual mgmt | ✅ Committed |

---

## 🌐 Portal URLs

- **Production:** https://submit.nstconstruct.xyz
- **Local Dev:** http://localhost:5173/submit

---

## 🔧 Environment Variables

Add to `.env`:
```bash
# Submission settings
SUBMISSION_CLOSED=false
SUBMISSION_URL=https://submit.nstconstruct.xyz
VITE_SUBMIT_DEADLINE="December 5, 2025"
VITE_SUBMIT_SUPPORT_EMAIL=support@nstconstruct.xyz

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@nstconstruct.xyz
```

---

## 🐛 Troubleshooting

### Team didn't receive code
```bash
# Check if code exists
node scripts/manage-submission-code.js show team@example.com

# Resend to that team
node scripts/send-submission-codes.js --team-email team@example.com
```

### Code not working
```bash
# Verify the code
node scripts/manage-submission-code.js verify team@example.com THEIR-CODE-HERE

# If wrong, reset it
node scripts/manage-submission-code.js reset team@example.com
```

### Lost plain codes file
1. Download from Firebase `submissionAccessKeys` collection
2. Or regenerate: `node scripts/generate-submission-codes.js --update-existing`

---

## ✅ Checklist

Before sending codes:
- [ ] All registrations are in Firebase
- [ ] Generated codes with script
- [ ] Reviewed `data/submission-codes-plain.json`
- [ ] Tested email template
- [ ] SMTP credentials configured
- [ ] Submission portal is accessible

After sending:
- [ ] Monitor email delivery
- [ ] Check spam folders
- [ ] Backup `submission-codes-plain.json`
- [ ] Open submission portal
- [ ] Monitor Firebase `finalSubmissions` collection

---

## 📧 Email Template Preview

Subject: `🔐 Your CoNSTruct Submission Code — Team Name`

Contains:
- Unique access code (formatted and highlighted)
- Submission URL
- Step-by-step instructions
- Deadline
- Support contact

---

## 🔒 Security Notes

⚠️ **IMPORTANT:**
- Never commit `submission-codes-plain.json`
- Keep SMTP credentials secure
- Access codes are single-use per team
- Codes are case-sensitive
- Session expires after successful submission

---

## 📞 Support

- **Technical:** goyalgeetansh@gmail.com
- **Organizer:** saurabhkumar@newtonschool.co
- **Docs:** `/docs/SUBMISSION_CODES.md`
