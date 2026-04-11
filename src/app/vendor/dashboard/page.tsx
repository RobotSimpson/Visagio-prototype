"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import VendorNegotiationChat from "./VendorNegotiationChat";
import POConfirmationModal from "./POConfirmationModal";

// Initialize Supabase using placeholder credentials from the environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://twsrhjobtdarxiaxyrok.supabase.co/";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3c3Joam9idGRhcnhpYXh5cm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NzgwODgsImV4cCI6MjA5MTQ1NDA4OH0.sSxnmgqnHYWW_NNOExxip82NPMlOkv3rSCxGYD-nEtM";
const supabase = createClient(supabaseUrl, supabaseKey);

// Based on the Build Plan, we use a placeholder UUID to prevent Postgres schema errors
const DEMO_VENDOR_ID = process.env.NEXT_PUBLIC_VENDOR_ID || "00000000-0000-0000-0000-000000000000";

export default function VendorDashboard() {
    const [negotiations, setNegotiations] = useState<any[]>([]);
    const [selectedNegotiationId, setSelectedNegotiationId] = useState<string | null>(null);
    const [selectedPO, setSelectedPO] = useState<any | null>(null);

    // Global predetermined parameters (creates the illusion of choice globally for the MVP demo)
    const [globalParameters, setGlobalParameters] = useState({
        targetPrice: 50000,
        minPrice: 40000,
        aiEnabled: true,
        concessionRate: 5
    });

    useEffect(() => {
        // 1. Fetch active negotiations
        const fetchNegotiations = async () => {
            const { data, error } = await supabase
                .from("negotiations")
                .select(`
                    id,
                    round_count,
                    status,
                    current_offer_buyer,
                    current_offer_vendor,
                    purchase_requests (
                        category,
                        organisations (
                            name
                        )
                    ),
                    negotiation_messages (
                        sender_type,
                        created_at
                    )
                `)
                .eq("vendor_id", DEMO_VENDOR_ID);

            if (error) {
                console.error("Error fetching negotiations:", error);
            } 
            
            const formattedData = data ? data.map((n: any) => {
                let isPendingVendor = false;
                if (n.negotiation_messages && n.negotiation_messages.length > 0) {
                    const sortedMsgs = [...n.negotiation_messages].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                    const lastMsg = sortedMsgs[0];
                    if (lastMsg.sender_type === 'buyer_human' || lastMsg.sender_type === 'buyer_ai') {
                        isPendingVendor = true;
                    }
                }
                
                return {
                    id: n.id,
                    // If org mapping doesn't deeply nest as shown, adjust as required.
                    buyerCompany: n.purchase_requests?.organisations?.name || "Acme Manufacturing",
                    item: n.purchase_requests?.category || "Unknown Item",
                    latestOffer: n.current_offer_vendor || n.current_offer_buyer || "Awaiting Offer",
                    round: n.round_count || 1,
                    status: n.status,
                    isPendingVendor
                };
            }) : [];

            setNegotiations(formattedData);
        };

        fetchNegotiations();

        // 2. Realtime subscription to the negotiation_messages table
        const channel = supabase.channel('realtime_negotiation_messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'negotiation_messages'
                },
                (payload) => {
                    const newMsg = payload.new as any;
                    setNegotiations(prev => prev.map(neg => {
                        if (neg.id === newMsg.negotiation_id && newMsg.price_offered) {
                            return {
                                ...neg,
                                latestOffer: newMsg.price_offered
                            };
                        }
                        return neg;
                    }));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const getStatusBadge = (neg: any) => {
        if (neg.isPendingVendor && neg.status === 'active') return <Badge className="bg-amber-500">Pending your response</Badge>;
        if (neg.status === 'active') return <Badge className="bg-green-500">Negotiating</Badge>;
        if (neg.status === 'agreed') return <Badge className="bg-blue-500">Agreed</Badge>;
        return <Badge variant="outline">{neg.status}</Badge>;
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-8">Vendor Control Center</h1>

            {/* 1. Stat Cards  */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <StatCard title="Active Negotiations" value={negotiations.length.toString()} />
                <StatCard
                    title="Pending Responses"
                    value={negotiations.filter(n => n.isPendingVendor && n.status === 'active').length.toString()}
                    highlight
                />
                <StatCard title="Won This Month" value="4" />
                <StatCard title="Avg Response Time" value="12 min" />
            </div>

            {/* 2. Negotiations Table  */}
            <Card>
                <CardHeader>
                    <CardTitle>Current Bids</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Buyer Company</TableHead>
                                <TableHead>Item</TableHead>
                                <TableHead>Latest Offer</TableHead>
                                <TableHead>Round</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {negotiations.map((neg) => (
                                <TableRow
                                    key={neg.id}
                                    className={`cursor-pointer hover:bg-slate-50 transition-colors ${(neg.isPendingVendor && neg.status === 'active') ? 'bg-amber-50' : ''}`}
                                    onClick={() => {
                                        if (neg.status === 'agreed') {
                                            setSelectedPO(neg);
                                        } else {
                                            setSelectedNegotiationId(neg.id);
                                        }
                                    }}
                                >
                                    <TableCell className="font-medium">{neg.buyerCompany}</TableCell>
                                    <TableCell>{neg.item}</TableCell>
                                    <TableCell>
                                        {typeof neg.latestOffer === 'number' ? `$${neg.latestOffer}` : neg.latestOffer}
                                    </TableCell>
                                    <TableCell>Round {neg.round}</TableCell>
                                    <TableCell>{getStatusBadge(neg)}</TableCell>
                                </TableRow>
                            ))}
                            {negotiations.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                                        Loading or no active negotiations...
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {selectedNegotiationId && (
                <VendorNegotiationChat
                    negotiationId={selectedNegotiationId}
                    onClose={() => setSelectedNegotiationId(null)}
                    supabase={supabase}
                    globalParameters={globalParameters}
                    setGlobalParameters={setGlobalParameters}
                />
            )}

            {selectedPO && (
                <POConfirmationModal
                    negotiation={selectedPO}
                    onClose={() => setSelectedPO(null)}
                />
            )}
        </div>
    );
}

function StatCard({ title, value, highlight = false }: { title: string; value: string; highlight?: boolean }) {
    return (
        <Card className={highlight ? "border-amber-400 bg-amber-50" : ""}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}