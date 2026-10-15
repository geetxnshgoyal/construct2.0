import { calendarDays, calendarMilestones, calendarStart, eventMeta, phaseStartDay, timeline, type PhaseKey } from '../../data/hackathon';
import { useCountdown } from '../../hooks/useCountdown';
import PixelEdge from '../ui/PixelEdge';

const DAY_MS = 24 * 60 * 60 * 1000;
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

const phaseColor: Record<PhaseKey, string> = {
  ideathon: 'bg-replit',
  build: 'bg-nst',
  ship: 'bg-white'
};

const phaseForDay = (day: number): PhaseKey => {
  if (day >= phaseStartDay.ship) return 'ship';
  if (day >= phaseStartDay.build) return 'build';
  return 'ideathon';
};

// Index of today in the calendar, using the IST calendar date.
const todayIndex = () => {
  const nowIst = new Date(Date.now() + IST_OFFSET_MS);
  const todayUtc = Date.UTC(nowIst.getUTCFullYear(), nowIst.getUTCMonth(), nowIst.getUTCDate());
  const [y, m, d] = calendarStart.split('-').map(Number);
  return Math.round((todayUtc - Date.UTC(y, m - 1, d)) / DAY_MS);
};

const dayLabel = (day: number) => {
  const [y, m, d] = calendarStart.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d) + day * DAY_MS).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC'
  });
};

export default function HeroSection() {
  const { remaining, isComplete } = useCountdown(eventMeta.pitchDeadline);
  const today = todayIndex();
  const milestoneByDay = new Map(calendarMilestones.map((milestone) => [milestone.day, milestone.label]));

  const status =
    today < 0
      ? today === -1
        ? 'Kicks off tomorrow'
        : `Kicks off in ${-today} days`
      : today >= calendarDays
        ? 'That’s a wrap'
        : `Day ${today + 1} of ${calendarDays}`;

  const countdown = [
    { value: remaining.days, unit: 'days' },
    { value: remaining.hours, unit: 'hrs' },
    { value: remaining.minutes, unit: 'min' },
    { value: remaining.seconds, unit: 'sec' }
  ];

  return (
    <>
      <section id="top" className="bg-navy text-white">
        <div className="mx-auto max-w-6xl px-6 pb-8 pt-12 sm:pt-16">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <img src="/assets/logos/construct-2-logo.png" alt="CoNSTruct 2.0" className="h-8 w-auto sm:h-10" />
            <span className="text-sm text-white/60">powered by</span>
            <img src="/assets/logos/replit-logo.svg" alt="Replit" className="h-6 w-auto sm:h-7" />
          </div>

          <div className="mt-12 grid gap-12 lg:grid-cols-[1.25fr_1fr] lg:items-end">
            <h1 className="font-pixel text-[clamp(3.5rem,11vw,7.75rem)] leading-[0.92]">
              Pitch.
              <br />
              Build.
              <br />
              Ship.
            </h1>

            <div className="max-w-md">
              <p className="text-lg leading-relaxed text-white/80">
                A month-long product + AI hackathon for 2500+ students across {eventMeta.location}. Pitch an idea, build it on Replit
                if you make the top 300, and ship it to real users by Nov 20.
              </p>

              <div id="countdown" className="mt-8 border-t-2 border-white/20 pt-6">
                {isComplete ? (
                  <p className="text-white/80">Pitches are closed. The top 300 are announced on Oct 26.</p>
                ) : (
                  <>
                    <p className="font-semibold text-replit">Pitches close in</p>
                    <dl className="mt-3 flex gap-6">
                      {countdown.map((item) => (
                        <div key={item.unit} className="flex flex-col-reverse">
                          <dt className="text-sm text-white/60">{item.unit}</dt>
                          <dd className="font-pixel text-4xl tabular-nums sm:text-5xl">{String(item.value).padStart(2, '0')}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="mt-4 text-sm text-white/60">Oct 22 at 11:59 PM IST, on the Replit Slides template.</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-16" aria-label="Hackathon calendar, Oct 16 to Nov 20">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
              <p className="font-pixel text-lg">{status}</p>
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/70">
                {timeline.map((phase) => (
                  <li key={phase.id} className="flex items-center gap-2">
                    <span className={`h-3 w-3 ${phaseColor[phase.id]}`} aria-hidden="true" />
                    {phase.title}, {phase.dates}
                  </li>
                ))}
              </ul>
            </div>

            <ol className="mt-5 grid grid-cols-[repeat(18,minmax(0,1fr))] gap-1 sm:gap-1.5 lg:grid-cols-[repeat(36,minmax(0,1fr))]">
              {Array.from({ length: calendarDays }, (_, day) => {
                const isPast = day < today;
                const isToday = day === today;
                const milestone = milestoneByDay.get(day);
                return (
                  <li
                    key={day}
                    title={`${dayLabel(day)}${milestone ? `: ${milestone}` : ''}`}
                    className={`pixel-in relative aspect-square ${isPast ? 'bg-navyRaised' : phaseColor[phaseForDay(day)]} ${
                      isToday ? 'outline outline-2 outline-offset-2 outline-white' : ''
                    }`}
                    style={{ animationDelay: `${day * 22}ms` }}
                  >
                    {milestone ? <span className="absolute inset-[30%] bg-navy" aria-hidden="true" /> : null}
                    <span className="sr-only">
                      {dayLabel(day)}
                      {milestone ? `, ${milestone}` : ''}
                    </span>
                  </li>
                );
              })}
            </ol>

            <ol className="mt-3 hidden grid-cols-[repeat(36,minmax(0,1fr))] gap-1.5 text-xs text-white/70 lg:grid" aria-hidden="true">
              {calendarMilestones.map((milestone) => {
                const last = milestone.day === calendarDays - 1;
                return (
                  <li
                    key={milestone.day}
                    className={`relative whitespace-nowrap border-l-2 border-white/40 pl-1.5 pt-1 ${last ? 'justify-self-end border-l-0 border-r-2 pl-0 pr-1.5 text-right' : ''}`}
                    style={{ gridColumnStart: milestone.day + 1, gridRowStart: 1 }}
                  >
                    <span className="block font-semibold text-white">{dayLabel(milestone.day)}</span>
                    {milestone.label}
                  </li>
                );
              })}
            </ol>

            <ol className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-white/70 sm:grid-cols-3 lg:hidden">
              {calendarMilestones.map((milestone) => (
                <li key={milestone.day}>
                  <span className="font-semibold text-white">{dayLabel(milestone.day)}</span> {milestone.label}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
      <PixelEdge direction="down" />
    </>
  );
}
