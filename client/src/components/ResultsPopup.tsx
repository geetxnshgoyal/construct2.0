import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { Trophy, ExternalLink } from 'lucide-react';

const STORAGE_KEY = 'construct-results-popup-2025';

// Results reveal time: 7PM IST on December 13, 2025
const REVEAL_TIME = new Date('2025-12-13T19:00:00+05:30').getTime();

interface Winner {
    awardName: string;
    teamName: string;
    collegeName: string;
    phLink?: string;
}

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

export default function ResultsPopup() {
    const [shouldRender, setShouldRender] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isRevealed, setIsRevealed] = useState(false);

    const dismiss = useCallback(() => {
        setIsOpen(false);
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(STORAGE_KEY, 'true');
        }
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined' || !WINNERS_DATA.enabled) {
            return;
        }

        // Check if results are revealed (after 7PM)
        const checkRevealTime = () => {
            const now = Date.now();
            return now >= REVEAL_TIME;
        };

        // Initial check
        if (!checkRevealTime()) {
            // Before 7PM - don't show popup
            return;
        }

        setIsRevealed(true);

        // Show popup on every page load after results are revealed
        setShouldRender(true);
        const timer = window.setTimeout(() => setIsOpen(true), 1500);

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                dismiss();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.clearTimeout(timer);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [dismiss]);

    // Don't show popup before reveal time or if not enabled
    if (!shouldRender || !WINNERS_DATA.enabled || !isRevealed) {
        return null;
    }

    const getCategoryColor = (awardName: string) => {
        if (awardName.includes('Champion')) return 'from-yellow-400 to-yellow-600';
        if (awardName.includes('Choice')) return 'from-purple-400 to-purple-600';
        if (awardName.includes('Freshers')) return 'from-green-400 to-green-600';
        return 'from-accentAlt to-accent';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 px-3 py-6 backdrop-blur-md sm:px-6 sm:py-8"
                    onClick={dismiss}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-br from-paper via-white to-paper/90 shadow-2xl border border-ink/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            type="button"
                            aria-label="Close results announcement"
                            onClick={dismiss}
                            className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink/10 text-2xl text-ink transition hover:bg-ink/20 hover:rotate-90 duration-300"
                        >
                            ×
                        </button>

                        {/* Header */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-accentAlt via-accent to-accentAlt/80 px-8 py-10 text-center">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="relative"
                            >
                                <div className="mb-4 flex justify-center">
                                    <Trophy className="h-14 w-14 text-white drop-shadow-lg" />
                                </div>
                                <h2 className="font-display text-3xl text-white sm:text-4xl mb-2">
                                    Winners Announced!
                                </h2>
                                <p className="text-white/90 text-base font-medium">
                                    Congratulations to all the winners of CoNSTruct 2025
                                </p>
                            </motion.div>
                        </div>

                        {/* Winners List */}
                        <div className="px-6 py-6 sm:px-8 space-y-4">
                            {WINNERS_DATA.winners.map((winner, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                    className="group relative overflow-hidden rounded-2xl border border-ink/10 bg-white p-5 shadow-card"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        {/* Left: Award & Team Info */}
                                        <div>
                                            <div className={`inline-block rounded-full bg-gradient-to-r ${getCategoryColor(winner.awardName)} px-3 py-0.5 mb-2`}>
                                                <p className="text-xs font-bold text-white uppercase tracking-wider">
                                                    {winner.awardName}
                                                </p>
                                            </div>
                                            <p className="text-lg font-semibold text-ink">
                                                {winner.teamName}
                                            </p>
                                            <p className="text-sm text-ink/60">
                                                {winner.collegeName}
                                            </p>
                                        </div>

                                        {/* Right: Product Hunt Link */}
                                        {winner.phLink && winner.phLink !== '#' && (
                                            <a
                                                href={winner.phLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 rounded-full bg-[#ff6154] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#e5574b]"
                                            >
                                                <svg className="h-4 w-4" viewBox="0 0 40 40" fill="currentColor">
                                                    <path d="M20 0C8.954 0 0 8.954 0 20s8.954 20 20 20 20-8.954 20-20S31.046 0 20 0zm0 36.364C11.006 36.364 3.636 28.994 3.636 20 3.636 11.006 11.006 3.636 20 3.636c8.994 0 16.364 7.37 16.364 16.364 0 8.994-7.37 16.364-16.364 16.364zm-2.727-10.91h-4.546V14.546h7.273c3.012 0 5.454 2.442 5.454 5.454S23.012 25.454 20 25.454zm0-7.272h-1.818v3.636H20c1.004 0 1.818-.814 1.818-1.818S21.004 18.182 20 18.182z" />
                                                </svg>
                                                Product Hunt
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-ink/10 bg-paper/50 px-8 py-5 text-center">
                            <p className="text-sm text-ink/60 mb-3">
                                Thank you to all participants for making CoNSTruct 2025 amazing!
                            </p>
                            <button
                                onClick={dismiss}
                                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 font-medium text-white transition hover:bg-accentAlt"
                            >
                                View Full Results
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
