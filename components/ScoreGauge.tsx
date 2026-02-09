"use client";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface ScoreGaugeProps {
    score: number; // 0 to 1
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
    animated?: boolean;
}

export function ScoreGauge({ score, size = "md", showLabel = true, animated = true }: ScoreGaugeProps) {
    const [displayScore, setDisplayScore] = useState(animated ? 0 : score);

    useEffect(() => {
        if (!animated) {
            setDisplayScore(score);
            return;
        }

        const duration = 1000;
        const steps = 60;
        const stepDuration = duration / steps;
        let currentStep = 0;

        const interval = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setDisplayScore(score * easeOut);

            if (currentStep >= steps) {
                clearInterval(interval);
                setDisplayScore(score);
            }
        }, stepDuration);

        return () => clearInterval(interval);
    }, [score, animated]);

    const percent = displayScore * 100;
    const getTone = (s: number) => {
        if (s > 0.60) return "green";
        if (s >= 0.35) return "yellow";
        return "red";
    };
    const tone = getTone(displayScore);

    const colors = {
        green: "#22c55e",
        yellow: "#f59e0b",
        red: "#ef4444"
    };

    const sizeValues = {
        sm: { width: 120, height: 80, fontSize: "text-2xl" },
        md: { width: 200, height: 120, fontSize: "text-4xl" },
        lg: { width: 280, height: 160, fontSize: "text-5xl" }
    };

    const { width, height, fontSize } = sizeValues[size];

    // Semicircle gauge data
    const gaugeData = [
        { value: percent, color: colors[tone] },
        { value: 100 - percent, color: "#27272a" }
    ];

    return (
        <div className="relative flex flex-col items-center">
            <div style={{ width, height: height + 20 }} className="relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={gaugeData}
                            cx="50%"
                            cy="85%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius="70%"
                            outerRadius="100%"
                            dataKey="value"
                            stroke="none"
                        >
                            {gaugeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                {showLabel && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ paddingTop: height * 0.3 }}>
                        <span className={`${fontSize} font-bold`} style={{ color: colors[tone] }}>
                            {percent.toFixed(0)}%
                        </span>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-2 text-xs text-zinc-500">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span>&lt;35% SOS</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span>35-60% Estable</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>&gt;60% Sólido</span>
                </div>
            </div>
        </div>
    );
}
