# Scripts - Submission Code Management

## ⚠️ IMPORTANT: Email Safety

**ALL email-sending scripts require explicit confirmation to prevent accidental sends.**

### Safe Commands (No emails sent)
```bash
# Generate codes - NO EMAILS
node scripts/generate-submission-codes.js

# Test email to yourself - SAFE
node scripts/send-submission-codes.js --test your-email@example.com

# Manage individual codes - NO EMAILS
node scripts/manage-submission-code.js show team@example.com
node scripts/manage-submission-code.js generate team@example.com
node scripts/manage-submission-code.js verify team@example.com CODE-HERE

# Run tests - NO EMAILS
node scripts/test-submission-codes.js
```

### Commands That Send Real Emails (Require --confirm)
```bash
# These will show a warning and EXIT unless --confirm is provided:

# Send to all teams
node scripts/send-submission-codes.js --confirm

# Send to one team
node scripts/send-submission-codes.js --team-email team@example.com --confirm
```

## Script Overview

| Script | Purpose | Sends Emails? | Needs Confirm? |
|--------|---------|---------------|----------------|
| `generate-submission-codes.js` | Generate unique codes | ❌ No | N/A |
| `send-submission-codes.js` | Email codes to teams | ✅ Yes | ✅ Required |
| `manage-submission-code.js` | Manage individual codes | ❌ No | N/A |
| `test-submission-codes.js` | Test code system | ❌ No | N/A |
| `sync-codes-to-firebase.js` | Sync codes to Firebase | ❌ No | ✅ Required |
| `update-single-code-firebase.js` | Update one team's code | ❌ No | N/A |

## Recommended Workflow

### Before Sending Codes

1. **Generate codes** (safe, no emails)
   ```bash
   node scripts/generate-submission-codes.js
   ```

2. **Review generated codes**
   ```bash
   cat data/submission-codes-plain.json | jq
   # Or open in editor to review
   ```

3. **Test email template** (sends to YOUR email only)
   ```bash
   node scripts/send-submission-codes.js --test your-email@example.com
   ```

4. **Check email looks good** in your inbox

5. **Get permission** from organizers to send codes

### Sending Codes (With Permission)

6. **Send to all teams** (requires explicit --confirm)
   ```bash
   node scripts/send-submission-codes.js --confirm
   ```

   **OR send to one team first as final test:**
   ```bash
   node scripts/send-submission-codes.js --team-email your-team@example.com --confirm
   ```

## Firebase Management

### Sync All Codes to Firebase

Upload all hashed codes from JSON to Firebase:

```bash
# Dry run (shows what would happen)
node scripts/sync-codes-to-firebase.js

# Actually sync to Firebase
node scripts/sync-codes-to-firebase.js --confirm
```

This uploads all entries from `data/submission-access.json` to the `submissionAccessKeys` collection in Firestore.

### Update a Single Team's Code

If you need to reset or update one team's access code:

```bash
# Regenerate a random code
node scripts/update-single-code-firebase.js student@university.edu --regenerate

# Set a specific code
node scripts/update-single-code-firebase.js student@university.edu ABCD-1234-WXYZ
```

This updates:
- ✅ Local JSON files (hashed + plain)
- ✅ Firebase Firestore (if available)

**Then send the new code:**
```bash
node scripts/send-submission-codes.js --team-email student@university.edu --confirm
```

## Safety Features

✅ **Double confirmation required** - Script will exit without --confirm flag  
✅ **Clear warnings** - Shows what will happen before proceeding  
✅ **Test mode** - Send to your own email first with --test  
✅ **Rate limiting** - 1 second delay between emails  
✅ **Logging** - All sends logged to console  
✅ **Error handling** - Failed sends are tracked and reported  

## Emergency Stop

If emails are being sent and you need to stop:
1. Press `Ctrl+C` in the terminal
2. Script will stop immediately
3. Check Firebase logs to see which emails were sent
4. Resume with `--team-email` for specific teams if needed

## Questions?

- Check docs: `/docs/SUBMISSION_CODES.md`
- Quick ref: `/docs/SUBMISSION_QUICK_REFERENCE.md`
- Contact: goyalgeetansh@gmail.com
