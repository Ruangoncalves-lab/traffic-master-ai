import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Filter, ChevronDown, RefreshCw } from 'lucide-react';
import KPIGrid from '../components/dashboard/KPIGrid';
import PerformanceChart from '../components/dashboard/PerformanceChart';
import AlertsSection from '../components/dashboard/AlertsSection';
import AIOpportunities from '../components/dashboard/AIOpportunities';
import DashboardWidgets from '../components/dashboard/DashboardWidgets';

const Dashboard = () => {
    const [dateRange, setDateRange] = useState('Últimos 7 dias');
    const [platform, setPlatform] = useState('Todas as Plataformas');

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <motion.div
            className="space-y-6 lg:space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* 1. Top Bar: Global Filters */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-[20px] shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Visão Geral</h1>
                    <p className="text-sm text-gray-500">Acompanhe o desempenho de todas as suas campanhas.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Platform Filter */}
                    <div className="relative group">
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-full text-sm font-medium text-gray-700 transition-colors">
                            <Filter size={16} className="text-gray-400" />
                            {platform}
                            <ChevronDown size={14} className="text-gray-400" />
                        </button>
                        {/* Dropdown would go here */}
                    </div>

                    {/* Date Filter */}
                    <div className="relative">
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-full text-sm font-medium text-gray-700 transition-colors">
                            <Calendar size={16} className="text-gray-400" />
                            {dateRange}
                            <ChevronDown size={14} className="text-gray-400" />
                        </button>
                    </div>

                    {/* Refresh Button */}
                    <button className="p-2 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100 transition-colors">
                        <RefreshCw size={18} />
                    </button>
                </div>
            </motion.div>

            {/* 2. KPI Grid (Metrics) */}
            <motion.section variants={itemVariants}>
                <KPIGrid />
            </motion.section>

            {/* 3. Main Chart & Widgets */}
            <motion.section variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Main Chart (Spans 2 columns on large screens) */}
                <div className="xl:col-span-2">
                    <PerformanceChart />
                </div>

                {/* AI Alerts (Right Column) */}
                <div className="flex flex-col gap-6">
                    <AlertsSection />
                </div>
            </motion.section>

            {/* 4. Secondary Widgets (Spikes, Creatives, Distribution) */}
            <motion.section variants={itemVariants}>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                    Insights Detalhados
                </h2>
                <DashboardWidgets />
            </motion.section>

            {/* 5. AI Opportunities (Full Width or Grid) */}
            <motion.section variants={itemVariants}>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                    Sugestões da Inteligência Artificial
                </h2>
                <AIOpportunities />
            </motion.section>
        </motion.div>
    );
};

export default Dashboard;
