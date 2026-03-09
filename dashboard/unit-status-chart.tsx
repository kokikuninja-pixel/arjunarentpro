'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Unit, UnitStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { useTheme } from 'next-themes';
import { useAuth } from '@/features/auth/hooks/use-auth';

interface UnitStatusChartProps {
  scope?: 'global' | 'branch';
  branchId?: string;
}

const statusColors: Record<UnitStatus, string> = {
    available: 'hsl(var(--chart-2))', // green
    rented: 'hsl(var(--chart-5))', // red-ish/orange
    reserved: 'hsl(var(--chart-1))', // blue
    maintenance: 'hsl(var(--chart-4))', // yellow
};

export function UnitStatusChart({ scope = 'branch', branchId }: UnitStatusChartProps) {
    const { theme } = useTheme();
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    
    const axisColor = theme === 'dark' ? '#888' : '#333';

    useEffect(() => {
        if (scope === 'branch' && !branchId) {
            setLoading(false);
            setUnits([]);
            return;
        }

        setLoading(true);
        let q = query(collection(db, 'units'));
        if (scope === 'branch' && branchId) {
            q = query(q, where('branchId', '==', branchId));
        }
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setUnits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Unit)));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching units for chart:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [branchId, scope]);

    const chartData = useMemo(() => {
        const statusCounts: Record<UnitStatus, number> = {
            available: 0,
            rented: 0,
            reserved: 0,
            maintenance: 0,
        };

        units.forEach(unit => {
            if (statusCounts[unit.status] !== undefined) {
                statusCounts[unit.status]++;
            }
        });

        return [
            { name: 'Tersedia', total: statusCounts.available, fill: statusColors.available },
            { name: 'Dipesan', total: statusCounts.reserved, fill: statusColors.reserved },
            { name: 'Disewa', total: statusCounts.rented, fill: statusColors.rented },
            { name: 'Perawatan', total: statusCounts.maintenance, fill: statusColors.maintenance },
        ];
    }, [units]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Distribusi Status Armada</CardTitle>
                <CardDescription>
                    Ringkasan jumlah unit berdasarkan status saat ini.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis
                            dataKey="name"
                            stroke={axisColor}
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke={axisColor}
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                            allowDecimals={false}
                        />
                        <Tooltip
                            cursor={{ fill: 'hsla(var(--muted))' }}
                            contentStyle={{ 
                                backgroundColor: 'hsl(var(--background))', 
                                border: '1px solid hsl(var(--border))',
                                borderRadius: 'var(--radius)'
                            }}
                        />
                        <Bar dataKey="total" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
