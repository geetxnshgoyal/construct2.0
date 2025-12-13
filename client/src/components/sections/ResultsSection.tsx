import { motion } from 'framer-motion';
import { Trophy, Sparkles, ExternalLink } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useState, useEffect } from 'react';

interface Winner {
    awardName: string;
    teamName: string;
    collegeName: string;
    phLink?: string;
}

// Results reveal time: 7PM IST on December 13, 2025
const REVEAL_TIME = new Date('2025-12-13T19:00:00+05:30').getTime();

// TODO: Update with actual winner data before 7PM
const WINNERS_DATA: {
    enabled: boolean;
    winners: Winner[];
} = {
    enabled: true,
    winners: [
        {
            awardName: 'Hackathon Champion',
            teamName: 'Team A2K',
            collegeName: 'NST-ADYPU',
            phLink: '#',
        },
        {
            awardName: "People's Choice",
            teamName: 'Team Cognix',
            collegeName: 'NST-ADYPU',
            phLink: '#',
        },
        {
            awardName: 'Best Freshers Team',
            teamName: 'Team Vanquishers',
            collegeName: 'NST-RU',
            phLink: '#',
        },
    ],
};

interface TimeLeft {
    hours: number;
    minutes: number;
    seconds: number;
}

function useCountdown(targetTime: number) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0 });
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = Date.now();
            const difference = targetTime - now;

            if (difference <= 0) {
                setIsComplete(true);
                return { hours: 0, minutes: 0, seconds: 0 };
            }

            return {
                hours: Math.floor(difference / (1000 * 60 * 60)),
                minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((difference % (1000 * 60)) / 1000),
            };
        };

        // Initial check
        const initial = calculateTimeLeft();
        setTimeLeft(initial);
        if (targetTime - Date.now() <= 0) {
            setIsComplete(true);
        }

        // Update every second
        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);
        }, 1000);

        return () => clearInterval(timer);
    }, [targetTime]);

    return { timeLeft, isComplete };
}

export default function ResultsSection() {
    const theme = useTheme();
    const isDark = theme === 'dark';
    const { timeLeft, isComplete } = useCountdown(REVEAL_TIME);

    if (!WINNERS_DATA.enabled) {
        return null;
    }

    const getCategoryColor = (awardName: string) => {
        if (awardName.includes('Champion')) return 'from-yellow-400 via-yellow-500 to-yellow-600';
        if (awardName.includes('Choice')) return 'from-purple-400 via-purple-500 to-purple-600';
        if (awardName.includes('Freshers')) return 'from-green-400 via-green-500 to-green-600';
        return 'from-accentAlt to-accent';
    };

    const getCategoryGlow = (awardName: string) => {
        if (awardName.includes('Champion')) return 'shadow-[0_0_40px_rgba(251,191,36,0.3)]';
        if (awardName.includes('Choice')) return 'shadow-[0_0_40px_rgba(192,132,252,0.3)]';
        if (awardName.includes('Freshers')) return 'shadow-[0_0_40px_rgba(74,222,128,0.3)]';
        return '';
    };

    // Theme-aware styling
    const sectionBg = isDark
        ? 'bg-transparent'
        : 'bg-gradient-to-b from-paper via-white to-paper';
    const headingColor = isDark ? 'text-white' : 'text-ink';
    const subTextColor = isDark ? 'text-white/70' : 'text-ink/70';
    const cardBg = isDark
        ? 'border-white/20 bg-white/10 backdrop-blur-sm'
        : 'border-ink/10 bg-white';

    // Countdown display (before 7PM)
    if (!isComplete) {
        return (
            <section id="results" className={`relative overflow-hidden py-12 sm:py-16 lg:py-24 ${sectionBg}`}>
                <div className="pointer-events-none absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,107,0,0.08),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,107,0,0.06),transparent_50%)]" />
                </div>

                <div className="mx-auto max-w-4xl px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="mb-8 flex justify-center"
                        >
                            <div className="relative">
                                <Trophy className="h-24 w-24 text-accent drop-shadow-lg" />
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                    className="absolute -right-2 -top-2"
                                >
                                    <Sparkles className="h-10 w-10 text-accentAlt" />
                                </motion.div>
                            </div>
                        </motion.div>

                        <h2 className={`font-display text-4xl sm:text-5xl lg:text-6xl mb-4 ${headingColor}`}>
                            Results Reveal
                        </h2>
                        <p className={`text-xl mb-12 ${subTextColor}`}>
                            The winners of CoNSTruct 2025 will be announced at 7:00 PM IST
                        </p>

                        {/* Countdown Timer */}
                        <div className="flex justify-center gap-4 sm:gap-8 mb-12">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className={`rounded-2xl border-2 p-6 sm:p-8 min-w-[100px] sm:min-w-[140px] ${cardBg}`}
                            >
                                <motion.span
                                    key={timeLeft.hours}
                                    initial={{ scale: 1.2, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className={`block font-display text-4xl sm:text-6xl ${headingColor}`}
                                >
                                    {String(timeLeft.hours).padStart(2, '0')}
                                </motion.span>
                                <span className={`text-sm uppercase tracking-widest ${subTextColor}`}>Hours</span>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className={`rounded-2xl border-2 p-6 sm:p-8 min-w-[100px] sm:min-w-[140px] ${cardBg}`}
                            >
                                <motion.span
                                    key={timeLeft.minutes}
                                    initial={{ scale: 1.2, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className={`block font-display text-4xl sm:text-6xl ${headingColor}`}
                                >
                                    {String(timeLeft.minutes).padStart(2, '0')}
                                </motion.span>
                                <span className={`text-sm uppercase tracking-widest ${subTextColor}`}>Minutes</span>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className={`rounded-2xl border-2 p-6 sm:p-8 min-w-[100px] sm:min-w-[140px] ${cardBg}`}
                            >
                                <motion.span
                                    key={timeLeft.seconds}
                                    initial={{ scale: 1.2, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className={`block font-display text-4xl sm:text-6xl ${headingColor}`}
                                >
                                    {String(timeLeft.seconds).padStart(2, '0')}
                                </motion.span>
                                <span className={`text-sm uppercase tracking-widest ${subTextColor}`}>Seconds</span>
                            </motion.div>
                        </div>

                        <p className={`text-base ${subTextColor}`}>
                            Stay tuned! The champions will be revealed soon.
                        </p>
                    </motion.div>
                </div>
            </section>
        );
    }

    // Results display (after 7PM)
    return (
        <section id="results" className={`relative overflow-hidden py-12 sm:py-16 lg:py-24 ${sectionBg}`}>
            {/* Background Effects */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,107,0,0.08),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,107,0,0.06),transparent_50%)]" />
            </div>

            <div className="mx-auto max-w-7xl px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.8 }}
                    className="mb-16 text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="mb-6 flex justify-center"
                    >
                        <div className="relative">
                            <Trophy className="h-20 w-20 text-accent drop-shadow-lg" />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                className="absolute -right-2 -top-2"
                            >
                                <Sparkles className="h-8 w-8 text-accentAlt" />
                            </motion.div>
                        </div>
                    </motion.div>

                    <h2 className={`font-display text-4xl sm:text-5xl lg:text-6xl mb-4 ${headingColor}`}>
                        Winners Announced
                    </h2>
                    <p className={`text-lg max-w-2xl mx-auto ${subTextColor}`}>
                        Congratulations to all the incredible teams who participated in CoNSTruct 2025!
                    </p>
                </motion.div>

                {/* Winners Grid */}
                <div className="space-y-8">
                    {WINNERS_DATA.winners.map((winner, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-100px' }}
                            transition={{ delay: index * 0.15, duration: 0.6 }}
                            className={`group relative overflow-hidden rounded-3xl border-2 p-8 shadow-card transition hover:shadow-cardHover ${cardBg} ${getCategoryGlow(winner.awardName)}`}
                        >
                            {/* Gradient Background */}
                            <div className="absolute inset-0 opacity-5">
                                <div className={`h-full w-full bg-gradient-to-br ${getCategoryColor(winner.awardName)}`} />
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute -right-20 -top-20 h-40 w-40 opacity-10">
                                <div className={`h-full w-full rounded-full bg-gradient-to-br ${getCategoryColor(winner.awardName)} blur-3xl`} />
                            </div>

                            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                                {/* Left: Award & Team Info */}
                                <div>
                                    <div className={`inline-block rounded-full bg-gradient-to-r ${getCategoryColor(winner.awardName)} px-4 py-1 mb-3`}>
                                        <p className="text-sm font-bold text-white uppercase tracking-wider">
                                            {winner.awardName}
                                        </p>
                                    </div>
                                    <p className={`text-2xl font-bold ${headingColor}`}>
                                        {winner.teamName}
                                    </p>
                                    <p className={`text-base ${subTextColor}`}>
                                        {winner.collegeName}
                                    </p>
                                </div>

                                {/* Right: Product Hunt Link */}
                                {winner.phLink && winner.phLink !== '#' && (
                                    <a
                                        href={winner.phLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-full bg-[#ff6154] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e5574b] hover:scale-105"
                                    >
                                        <svg className="h-5 w-5" viewBox="0 0 40 40" fill="currentColor">
                                            <path d="M20 0C8.954 0 0 8.954 0 20s8.954 20 20 20 20-8.954 20-20S31.046 0 20 0zm0 36.364C11.006 36.364 3.636 28.994 3.636 20 3.636 11.006 11.006 3.636 20 3.636c8.994 0 16.364 7.37 16.364 16.364 0 8.994-7.37 16.364-16.364 16.364zm-2.727-10.91h-4.546V14.546h7.273c3.012 0 5.454 2.442 5.454 5.454S23.012 25.454 20 25.454zm0-7.272h-1.818v3.636H20c1.004 0 1.818-.814 1.818-1.818S21.004 18.182 20 18.182z" />
                                        </svg>
                                        View on Product Hunt
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Closing Message */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="mt-16 text-center"
                >
                    <div className={`mx-auto max-w-2xl rounded-2xl border p-8 ${cardBg}`}>
                        <p className={`text-lg leading-relaxed ${subTextColor}`}>
                            A huge thank you to all participants, mentors, judges, and partners who made CoNSTruct 2025 an incredible success!
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
