'use client';
import React, { useState, useEffect } from 'react';
import { ResponsivePie } from '@nivo/pie';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

const CenterScore = ({ score, centerX, centerY }: { score: number, centerX: number, centerY: number }) => {
    const count = useMotionValue(0);
    const rounded = useTransform(count, latest => Math.round(latest));

    useEffect(() => {
        const targetScore = typeof score === 'number' ? score : 0;
        const animation = animate(count, targetScore, { 
            duration: 1.5, 
            ease: "easeOut" 
        });
        return () => animation.stop();
    }, [score, count]);

    return (
        <g transform={`translate(${centerX}, ${centerY})`}>
            <motion.text
                x={0}
                y={-5}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-6xl font-extrabold text-indigo-600"
            >
                {rounded}
            </motion.text>
            <text
                x={0}
                y={30}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-base font-semibold text-slate-500"
            >
                Overall Health
            </text>
        </g>
    );
};

export default function StrengthPieChart({ data, score }: { data: { name: string, count: number, color: string }[], score: number }) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const chartData = data
        .filter(item => item.count > 0)
        .map(item => ({
            id: item.name,
            label: item.name,
            value: item.count,
            color: item.color,
        }));

    if (!isClient) {
        return <div className="h-full w-full animate-pulse bg-gray-200 rounded-lg" />;
    }

    return (
        <div className="w-full h-full" style={{ height: '400px' }}>
            <ResponsivePie
                data={chartData}
                margin={{ top: 30, right: 40, bottom: 80, left: 40 }}
                innerRadius={0.7}
                padAngle={1}
                cornerRadius={4}
                activeOuterRadiusOffset={10}
                colors={{ datum: 'data.color' }}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                
                arcLinkLabelsSkipAngle={15}
                arcLinkLabelsTextColor="#333333"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLinkLabelsDiagonalLength={16}
                arcLinkLabelsStraightLength={24}

                arcLabelsSkipAngle={15}
                arcLabelsRadiusOffset={0.4}
                arcLabelsTextColor="white"

                theme={{
                    labels: {
                        text: {
                            fontSize: 14,
                            fontWeight: 'bold',
                        },
                    },
                    legends: {
                        text: {
                            fontSize: 14,
                        },
                    },
                    tooltip: {
                        container: {
                            background: '#ffffff',
                            borderRadius: '4px',
                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                        },
                    },
                }}

                tooltip={({ datum }) => (
                    <div
                        style={{
                            padding: '8px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        <div style={{ width: '12px', height: '12px', backgroundColor: datum.color, borderRadius: '50%' }} />
                        <strong className="text-sm font-semibold text-gray-900">{datum.label}:</strong>
                        <span className="text-sm text-gray-700">{datum.value}</span>
                    </div>
                )}
                
                motionConfig="wobbly"
                transitionMode="innerRadius"

                layers={['arcs', 'arcLabels', 'arcLinkLabels', 'legends', 
                    (props: { centerX: number, centerY: number }) => (
                        <CenterScore score={score} centerX={props.centerX} centerY={props.centerY} />
                    )
                ]}

                legends={[
                    {
                        anchor: 'bottom',
                        direction: 'row',
                        justify: false,
                        translateX: 0,
                        translateY: 60,
                        itemsSpacing: 20,
                        itemWidth: 80,
                        itemHeight: 20,
                        itemTextColor: '#555',
                        itemDirection: 'left-to-right',
                        itemOpacity: 1,
                        symbolSize: 14,
                        symbolShape: 'circle',
                        effects: [
                            {
                                on: 'hover',
                                style: {
                                    itemTextColor: '#000',
                                },
                            },
                        ],
                    },
                ]}
            />
        </div>
    );
}