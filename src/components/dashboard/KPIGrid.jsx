import React from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign,
    CreditCard,
    MousePointerClick,
    Eye,
    Activity,
    ShoppingBag,
    Users,
    BarChart2
} from 'lucide-react';
import MetricCard from '../MetricCard';

const KPIGrid = () => {
    const metrics = [
        {
            title: 'ROAS Total',
            value: '4.5x',
            change: '+12.5%',
            changeType: 'increase',
            icon: BarChart2,
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-600'
        },
        {
            title: 'Gasto Total',
            value: 'R$ 12.450',
            change: '+8.2%',
            changeType: 'increase',
            icon: DollarSign,
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600'
        },
        {
            title: 'CPC Médio',
            value: 'R$ 1,25',
            change: '-5.4%',
            changeType: 'decrease', // Good for CPC
            icon: MousePointerClick,
            iconBg: 'bg-purple-50',
            iconColor: 'text-purple-600'
        },
        {
            title: 'CPM Médio',
            value: 'R$ 15,30',
            change: '+2.1%',
            changeType: 'increase',
            icon: Eye,
            iconBg: 'bg-orange-50',
            iconColor: 'text-orange-600'
        },
        {
            title: 'CTR Médio',
            value: '2.8%',
            change: '+0.4%',
            changeType: 'increase',
            icon: Activity,
            iconBg: 'bg-indigo-50',
            iconColor: 'text-indigo-600'
        },
        {
            title: 'Frequência',
            value: '1.4',
            change: '0.0%',
            changeType: 'neutral',
            icon: Users,
            iconBg: 'bg-pink-50',
            iconColor: 'text-pink-600'
        },
        {
            title: 'Custo por Compra',
            value: 'R$ 45,00',
            change: '-12%',
            changeType: 'decrease', // Good
            icon: CreditCard,
            iconBg: 'bg-cyan-50',
            iconColor: 'text-cyan-600'
        },
        {
            title: 'Conversões',
            value: '276',
            change: '+18%',
            changeType: 'increase',
            icon: ShoppingBag,
            iconBg: 'bg-teal-50',
            iconColor: 'text-teal-600'
        },
        {
            title: 'Alcance',
            value: '145k',
            change: '+22%',
            changeType: 'increase',
            icon: Users,
            iconBg: 'bg-yellow-50',
            iconColor: 'text-yellow-600'
        },
        {
            title: 'Impressões',
            value: '350k',
            change: '+25%',
            changeType: 'increase',
            icon: Eye,
            iconBg: 'bg-rose-50',
            iconColor: 'text-rose-600'
        }
    ];

    return (
        <div className="grid grid-cols-1 gap-3 lg:gap-1.5 xl:gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
            {metrics.map((metric, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                    <MetricCard {...metric} />
                </motion.div>
            ))}
        </div>
    );
};

export default KPIGrid;
