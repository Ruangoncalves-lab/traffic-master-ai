import React, { useState } from 'react';
import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { ArrowUpRight } from 'lucide-react';

const PerformanceChart = () => {
    const [period, setPeriod] = useState('monthly');

    const data = [
        { name: 'Jan', revenue: 4000, spend: 2400 },
        { name: 'Feb', revenue: 3000, spend: 1398 },
        { name: 'Mar', revenue: 2000, spend: 9800 },
        { name: 'Apr', revenue: 2780, spend: 3908 },
        { name: 'May', revenue: 1890, spend: 4800 },
        { name: 'Jun', revenue: 2390, spend: 3800 },
        { name: 'Jul', revenue: 3490, spend: 4300 },
    ];

    return (
        <div className="card-premium p-5 lg:p-4 xl:p-6 flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 lg:mb-3">
                <div>
                    <h3 className="text-lg lg:text-base font-bold text-gray-900 mb-1">Resumo</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl lg:text-xl xl:text-2xl font-bold text-gray-900">R$ 32.678,90</span>
                        <span className="flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                            +12.8% <ArrowUpRight size={12} />
                        </span>
                    </div>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-full">
                    {['Diário', 'Semanal', 'Mensal'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p.toLowerCase())}
                            className={`px-3 py-1 lg:px-2 lg:py-0.5 rounded-full text-xs lg:text-[10px] xl:text-xs font-semibold transition-all ${period === p.toLowerCase() || (period === 'monthly' && p === 'Mensal')
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-full h-[300px] lg:h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                            <pattern id="stripe-pattern" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
                                <rect width="2" height="4" transform="translate(0,0)" fill="white" fillOpacity="0.3" />
                            </pattern>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1F2937',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#fff',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                            }}
                            itemStyle={{ color: '#fff', fontWeight: 600 }}
                            cursor={{ fill: '#F3F4F6' }}
                        />
                        <Bar dataKey="revenue" barSize={40} radius={[8, 8, 8, 8]} fill="#10B981">
                            {/* Overlay simulation using a second bar or pattern? Recharts supports SVG patterns in fill */}
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 3 ? '#059669' : '#10B981'} />
                            ))}
                        </Bar>
                        {/* Hatched overlay bar (visual trick, rendered on top with pattern) */}
                        <Bar dataKey="revenue" barSize={40} radius={[8, 8, 8, 8]} fill="url(#stripe-pattern)" />

                        <Line
                            type="monotone"
                            dataKey="spend"
                            stroke="#059669"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#059669', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PerformanceChart;
