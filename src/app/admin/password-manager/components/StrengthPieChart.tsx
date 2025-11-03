'use client';
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';

// A custom component to render the "active" or hovered pie segment
const ActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
        // Adding outline: 'none' here is critical to prevent the focus border on SVG elements.
        <g style={{ outline: 'none' }}>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 8}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                cornerRadius={8}
                style={{ outline: 'none' }}
            />
        </g>
    );
};

export default function StrengthPieChart({ data, score }: { data: { name: string, count: number, color: string }[], score: number }) {
    const [isClient, setIsClient] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const count = useMotionValue(0);
    const rounded = useTransform(count, latest => Math.round(latest));

    useEffect(() => {
        setIsClient(true);
        const animation = animate(count, score || 0, { duration: 1.5, ease: "easeOut" });
        return animation.stop;
    }, [score, count]);

    const chartData = data.filter(item => item.count > 0);
    const activeData = activeIndex !== null ? chartData[activeIndex] : null;

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    const onPieLeave = () => {
        setActiveIndex(null);
    };

    if (!isClient) {
        return <div className="h-full w-full animate-pulse bg-gray-200 rounded-lg" />;
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center select-none">
            {/* DEFINITIVE FIX FOR SHAPE: Using aspect-square ensures a perfect circle. */}
            <div className="w-full max-w-60 aspect-square relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <AnimatePresence mode="wait">
                        {activeData ? (
                            <motion.div
                                key={activeData.name}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                                className="text-center"
                            >
                                <p className="text-5xl font-extrabold" style={{ color: activeData.color }}>
                                    {activeData.count}
                                </p>
                                <p className="text-lg font-semibold text-slate-600">{activeData.name}</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="health-score"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                                className="text-center"
                            >
                                <motion.p className="text-6xl font-extrabold text-indigo-600">{rounded}</motion.p>
                                <p className="text-sm font-semibold text-slate-500 mt-1">Overall Health</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            activeIndex={activeIndex ?? -1}
                            activeShape={<ActiveShape />}
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={"80%"}
                            outerRadius={"100%"}
                            dataKey="count"
                            onMouseEnter={onPieEnter}
                            onMouseLeave={onPieLeave}
                            // DEFINITIVE FIX FOR CLICK: Disabling the click handler prevents focus.
                            onClick={() => {}}
                            cornerRadius={8}
                            paddingAngle={2}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${entry.name}`}
                                    fill={entry.color}
                                    stroke="none"
                                    style={{
                                        transition: 'opacity 0.2s ease',
                                        opacity: activeIndex === null || activeIndex === index ? 1 : 0.3,
                                    }}
                                />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="flex justify-center items-center gap-4 mt-6">
                {chartData.map((entry, index) => (
                    <motion.div
                        key={`legend-${entry.name}`}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded-lg"
                        onMouseEnter={() => onPieEnter(null, index)}
                        onMouseLeave={onPieLeave}
                        animate={{
                            backgroundColor: activeIndex === index ? `${entry.color}20` : 'transparent',
                        }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                    >
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="font-medium text-sm text-slate-600">{entry.name}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}