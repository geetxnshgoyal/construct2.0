export const eventMeta = {
  title: 'CoNSTruct 2.0',
  tagline: 'Build for Impact: a Product x AI hackathon, powered by Replit',
  timeframe: 'Oct 16 – Nov 20, 2026',
  duration: 'Month-long pitch-to-ship sprint',
  location: 'ADYPU, RU, SVyasa and SMRU',
  heroQuote: '“Pitch. Build. Ship.”',
  pitchDeadline: '2026-10-22T23:59:00+05:30'
};

export const tracks = [
  {
    id: 'track-a',
    badge: 'Track A',
    title: 'New Build',
    description: 'Start from a fresh idea and ship an MVP in three weeks.',
    judgedOn: 'Judged on the problem, the user, and how far you get from zero.'
  },
  {
    id: 'track-b',
    badge: 'Track B',
    title: 'Level Up',
    description: 'Bring a product you are already building, and show what you added or rebuilt on Replit during the hackathon.',
    judgedOn: 'Judged on what you add, not on what already exists. Your team must own the product.'
  }
];

export type PhaseKey = 'ideathon' | 'build' | 'ship';

export const timeline: Array<{
  id: PhaseKey;
  title: string;
  dates: string;
  who: string;
  entries: Array<{ date: string; text: string }>;
}> = [
  {
    id: 'ideathon',
    title: 'Ideathon',
    dates: 'Oct 16 – Oct 25',
    who: 'Open to every NST student',
    entries: [
      { date: 'Oct 16', text: 'Kickoff: format, tracks, rules, and a walkthrough of Replit' },
      { date: 'Week 1', text: 'Masterclass: problem framing and pitching with Replit Slides' },
      { date: 'Oct 22', text: 'Pitch submission closes at 11:59 PM' },
      { date: 'Oct 23–25', text: 'Judges score pitches on the ideathon rubric' }
    ]
  },
  {
    id: 'build',
    title: 'Build Sprint',
    dates: 'Oct 26 – Nov 8',
    who: 'The top 300',
    entries: [
      { date: 'Oct 26', text: 'Top 300 announced; $20 in Replit credits each' },
      { date: 'Weeks 2–3', text: 'Masterclasses: building with Replit Agent, design thinking and user research, prototyping and MVP scoping' },
      { date: 'Ongoing', text: 'Mentor office hours with product and AI builders' },
      { date: 'Nov 4', text: 'Checkpoint: deployed Replit link + one-page progress update' },
      { date: 'Nov 6', text: 'Top 50 announced; additional credits unlocked' }
    ]
  },
  {
    id: 'ship',
    title: 'Ship & Showcase',
    dates: 'Nov 7 – Nov 20',
    who: 'Shortlisted teams',
    entries: [
      { date: 'Week 4', text: 'Masterclass: product positioning, storytelling, and launch' },
      { date: 'Week 4', text: 'Public launch: real users, plus a post tagging Replit and NST' },
      { date: 'Nov 12', text: 'Final submission closes at 11:59 PM' },
      { date: 'Nov 13–19', text: 'Campus rounds pick each campus’s finalists' },
      { date: 'Nov 20', text: 'Grand Finale: finalists demo live to the judges' }
    ]
  }
];

// One square per day in the hero calendar, Oct 16 – Nov 20 2026.
export const calendarStart = '2026-10-16';
export const calendarDays = 36;
export const phaseStartDay: Record<PhaseKey, number> = { ideathon: 0, build: 10, ship: 22 };
export const calendarMilestones = [
  { day: 0, label: 'Kickoff' },
  { day: 6, label: 'Pitch due' },
  { day: 10, label: 'Top 300' },
  { day: 19, label: 'Checkpoint' },
  { day: 27, label: 'Final submission' },
  { day: 35, label: 'Grand Finale' }
];

export const weeklyMilestones = [
  { week: 'Week 1', name: 'Pitch', dates: 'Oct 16 – Oct 22', milestone: 'Idea pitched', proof: 'Replit Slides pitch submitted by Oct 22' },
  {
    week: 'Week 2',
    name: 'Start building',
    dates: 'Oct 23 – Oct 29',
    milestone: 'Top 300 shortlisted, first working build',
    proof: 'Credits activated; core feature running in Replit'
  },
  { week: 'Week 3', name: 'Deploy', dates: 'Oct 30 – Nov 5', milestone: 'MVP deployed', proof: 'Live Replit link + progress update at the Nov 4 checkpoint' },
  { week: 'Week 4', name: 'Launch', dates: 'Nov 6 – Nov 12', milestone: 'Product launched to real users', proof: 'Public launch link + social post' }
];

export const submissions = [
  {
    id: 'pitch',
    stage: 'Ideathon pitch',
    deadline: 'Oct 22, 11:59 PM IST',
    items: [
      'Replit Slides pitch, max 6 slides',
      'Problem, user, solution, why AI, 3-week build plan',
      'Track B: current product link + what you will add'
    ]
  },
  {
    id: 'checkpoint',
    stage: 'Checkpoint',
    deadline: 'Nov 4, 11:59 PM IST',
    items: ['Deployed Replit link', 'One-page progress update: built, learned, next']
  },
  {
    id: 'final',
    stage: 'Final',
    deadline: 'Nov 12, 11:59 PM IST',
    items: [
      'Live product link',
      'Pitch deck: problem, solution, impact, roadmap',
      '2 to 4 minute demo video',
      'Social post link',
      'Traction snapshot: users, feedback'
    ]
  }
];

export const rubricStages = ['Ideathon', 'Checkpoint', 'Final'] as const;

export const rubric: Array<{ criterion: string; description: string; weights: [string, string, string] }> = [
  { criterion: 'Product Thinking', description: 'Clarity of the problem and focus on a real user.', weights: ['35', '15', '20'] },
  { criterion: 'Innovation & AI Use', description: 'Originality of the solution and how meaningfully AI is used.', weights: ['25', '15', '20'] },
  {
    criterion: 'Execution Quality',
    description: 'A working, deployed product on Replit that people can actually use.',
    weights: ['15*', '40', '25']
  },
  { criterion: 'Progress Journey', description: 'How far the product moved from pitch to final.', weights: ['—', '30', '10'] },
  { criterion: 'Traction & Launch', description: 'Real users, feedback, and social reach.', weights: ['—', '—', '15'] },
  { criterion: 'Pitch & Storytelling', description: 'Clarity, confidence, and persuasiveness.', weights: ['25', '—', '10'] }
];

export const guidelinePanels: Array<{ id: string; title: string; required?: boolean; items: string[] }> = [
  {
    id: 'team',
    title: 'Teams',
    items: [
      '3 to 5 students per team, with at least one female student',
      'Cross-batch and cross-campus teams strongly encouraged',
      'At least one member attends every checkpoint and the campus round',
      'Track B teams must own the product they bring'
    ]
  },
  {
    id: 'credits',
    title: 'Credits',
    items: [
      'Shortlisting is by team: every member of a shortlisted team counts toward the 300',
      '$20 in Replit credits per shortlisted participant',
      'Additional credits for the top 50 builders after the Nov 4 checkpoint',
      'Credits are for building your hackathon product only'
    ]
  },
  {
    id: 'tools',
    title: 'Tools and platforms',
    items: [
      'Build on Replit: Agent, workspace, and deployments. The final product must be built and deployed on Replit',
      'Pitch on the Replit Slides template, shared at kickoff',
      'Frameworks: Lean Canvas, JTBD, MVP Roadmaps, User Journey Maps',
      'One Slack/Discord channel per campus, with campus leads for support'
    ]
  },
  {
    id: 'social',
    title: 'Social sharing',
    required: true,
    items: [
      'Every shortlisted team posts about its product on LinkedIn or X during Phase 3',
      'Tag Replit and Newton School of Technology, with the official hashtags shared at kickoff',
      'Add the post link to your final submission',
      'Teams without a verified post are not eligible for awards'
    ]
  }
];

export const prizes = [
  { name: 'Hackathon Champion (Best Overall Build)', amount: '₹15,000' },
  { name: 'People’s Choice Award', amount: '₹10,000' },
  { name: 'Best Freshers’ Team', amount: '₹7,000' }
];

export const takeaways = [
  'Hands-on product + AI building experience on Replit',
  'Pitched, prototyped, and shipped an MVP like a real founder',
  'Worked with mentors from industry and the Replit ecosystem',
  'A live product with real users and a public post to show for it',
  'A portfolio-ready project, and sharper teamwork, pitching, and execution'
];

export const partners = [
  {
    id: 'nst',
    name: 'Newton School of Technology',
    image: '/assets/logos/nst-logo.png',
    imageClass: 'h-12'
  },
  {
    id: 'replit',
    name: 'Replit',
    image: '/assets/logos/replit-logo.svg',
    imageClass: 'h-9'
  },
  {
    id: 'tpf',
    name: 'The Product Folks',
    image: '/assets/logos/tpf-logo.png',
    imageClass: 'h-16'
  }
];
