# CoNSTruct 2025 - Results Update Guide

## Quick Update Instructions for 6PM

When you're ready to announce the winners, update **TWO files** with the same winner data:

### Files to Update:

1. **`/client/src/components/ResultsPopup.tsx`** - Popup that appears on site visit
2. **`/client/src/components/sections/ResultsSection.tsx`** - Results section on homepage

---

## Winner Data Structure (Simplified)

Each winner entry has just 4 fields:

```typescript
{
  awardName: 'Hackathon Champion',  // Award category name
  teamName: 'Team Name',             // Winning team name
  collegeName: 'College Name',       // Team's college
  phLink: 'https://producthunt.com/...', // Product Hunt link (or '#' if none)
}
```

---

## Complete Example

```typescript
const WINNERS_DATA = {
  enabled: true,
  winners: [
    {
      awardName: 'Hackathon Champion',
      teamName: 'Code Wizards',
      collegeName: 'ADYPU, Pune',
      phLink: 'https://www.producthunt.com/posts/ai-study-buddy',
    },
    {
      awardName: "People's Choice",
      teamName: 'Tech Titans',
      collegeName: 'RU, Bangalore',
      phLink: 'https://www.producthunt.com/posts/ecotrack',
    },
    {
      awardName: 'Best Freshers Team',
      teamName: 'Innovation Squad',
      collegeName: 'ADYPU, Pune',
      phLink: 'https://www.producthunt.com/posts/healthhub',
    },
  ],
};
```

---

## Prize Amounts (Auto-derived)

The prize amounts are automatically derived from the award name:
- **Hackathon Champion** → ₹25,000
- **People's Choice** → ₹15,000
- **Best Freshers Team** → ₹10,000

---

## After Updating

1. **Save both files**
2. **Test locally** (if dev server is running, changes appear immediately)
3. **Deploy to production**:
   ```bash
   git add .
   git commit -m "Add CoNSTruct 2025 winners"
   git push
   ```

---

## Disabling the Popup

To disable only the popup after a few days:

In **`ResultsPopup.tsx`**, change:
```typescript
enabled: false,
```

The results section on homepage will remain visible.
