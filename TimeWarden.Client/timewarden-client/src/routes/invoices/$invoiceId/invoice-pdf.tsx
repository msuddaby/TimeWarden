import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { InvoiceVM } from '@/api/generated/models';
import {formatCurrency, formatDate, toNumber} from "@/lib/utils.ts";

const colors = {
    primary: '#1a1a2e',
    muted: '#6b7280',
    border: '#e5e7eb',
    headerBg: '#f9fafb',
    white: '#ffffff',
};

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        fontFamily: 'Helvetica',
        color: '#111827',
    },
    // Header
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontFamily: 'Helvetica-Bold',
        color: colors.primary,
    },
    invoiceDate: {
        fontSize: 11,
        color: colors.muted,
        marginTop: 4,
    },
    invoiceDateLabel: {
        fontFamily: 'Helvetica-Bold',
        color: '#374151',
    },
    headerRight: {
        textAlign: 'right',
    },
    headerLabel: {
        fontSize: 9,
        color: colors.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    headerId: {
        fontSize: 10,
        fontFamily: 'Courier',
        marginTop: 2,
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        marginVertical: 16,
    },
    // Address row (From / Bill To)
    addressRow: {
        flexDirection: 'row',
        gap: 24,
        marginBottom: 8,
    },
    addressCol: {
        flex: 1,
    },
    // Client
    clientSection: {
        marginBottom: 8,
    },
    sectionLabel: {
        fontSize: 9,
        color: colors.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    clientName: {
        fontSize: 14,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 2,
    },
    clientAttention: {
        fontSize: 10,
        color: colors.muted,
        marginBottom: 2,
    },
    clientAddress: {
        fontSize: 10,
        color: '#4b5563',
        lineHeight: 1.5,
    },
    // Summary
    summaryRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 8,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: colors.headerBg,
        borderRadius: 6,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    summaryLabel: {
        fontSize: 9,
        color: colors.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 18,
        fontFamily: 'Helvetica-Bold',
    },
    // Project sections
    projectSection: {
        marginTop: 16,
    },
    projectName: {
        fontSize: 13,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 8,
    },
    // Table
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    tableHeaderText: {
        color: colors.white,
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    tableRowAlt: {
        backgroundColor: '#f9fafb',
    },
    tableCell: {
        fontSize: 10,
    },
    tableCellBold: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
    },
    tableFooter: {
        flexDirection: 'row',
        backgroundColor: colors.headerBg,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
        borderTopWidth: 2,
        borderTopColor: colors.border,
    },
    // Column widths
    colDescription: { width: '38%' },
    colDate: { width: '18%', textAlign: 'right' },
    colRate: { width: '14%', textAlign: 'right' },
    colHours: { width: '14%', textAlign: 'right' },
    colAmount: { width: '16%', textAlign: 'right' },
    // Grand total
    grandTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        padding: 14,
        backgroundColor: colors.primary,
        borderRadius: 6,
    },
    grandTotalLabel: {
        fontSize: 13,
        fontFamily: 'Helvetica-Bold',
        color: colors.white,
    },
    grandTotalValue: {
        fontSize: 20,
        fontFamily: 'Helvetica-Bold',
        color: colors.white,
    },
    notesSection: {
        marginTop: 16,
    },
    notesLabel: {
        fontSize: 9,
        color: colors.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    notesText: {
        fontSize: 10,
        color: '#4b5563',
        lineHeight: 1.5,
    },
});

interface ProjectSection {
    projectName: string;
    items: { description: string; dateOfWork: string; rate: number; hours: number; amount: number }[];
    totalHours: number;
    total: number;
}

function buildSections(invoice: InvoiceVM): ProjectSection[] {
    const map = new Map<string, ProjectSection>();

    for (const item of invoice.itemsOfWork ?? []) {
        const projectId = item.projectId ?? 'uncategorised';
        if (!map.has(projectId)) {
            map.set(projectId, {
                projectName: item.project?.projectName ?? 'Uncategorised',
                items: [],
                totalHours: 0,
                total: 0,
            });
        }
        const section = map.get(projectId)!;
        const hours = toNumber(item.hoursOfWork);
        const rate = toNumber(item.hourlyRate);
        section.items.push({
            description: item.description ?? '',
            dateOfWork: item.dateOfWork ?? '',
            rate,
            hours,
            amount: rate * hours,
        });
        section.totalHours += hours;
        section.total += rate * hours;
    }

    for (const section of map.values()) {
        section.items.sort((a, b) => new Date(a.dateOfWork).getTime() - new Date(b.dateOfWork).getTime());
    }

    return Array.from(map.values());
}

export function InvoicePdf({ invoice }: { invoice: InvoiceVM }) {
    const sections = buildSections(invoice);
    const grandTotal = sections.reduce((sum, s) => sum + s.total, 0);
    const totalHours = sections.reduce((sum, s) => sum + s.totalHours, 0);
    const client = invoice.client;
    const user = invoice.user;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.title}>Invoice</Text>
                        <Text style={styles.invoiceDate}>
                            <Text style={styles.invoiceDateLabel}>Invoice Date: </Text>
                            {invoice.invoiceDate ? formatDate(invoice.invoiceDate) : 'No date'}
                        </Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.headerLabel}>Invoice ID</Text>
                        <Text style={styles.headerId}>{invoice.id?.slice(0, 8)}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* From / Bill To */}
                {(user || client) && (
                    <>
                        <View style={styles.addressRow}>
                            {user && (
                                <View style={styles.addressCol}>
                                    <Text style={styles.sectionLabel}>From</Text>
                                    {user.name && <Text style={styles.clientName}>{user.name}</Text>}
                                    {user.address && (
                                        <Text style={styles.clientAddress}>{user.address}</Text>
                                    )}
                                    {(user.city || user.province || user.zip) && (
                                        <Text style={styles.clientAddress}>
                                            {[user.city, user.province].filter(Boolean).join(', ')}{' '}
                                            {user.zip}
                                        </Text>
                                    )}
                                    {user.phone && (
                                        <Text style={styles.clientAddress}>{user.phone}</Text>
                                    )}
                                </View>
                            )}
                            {client && (
                                <View style={styles.addressCol}>
                                    <Text style={styles.sectionLabel}>Bill To</Text>
                                    {client.name && <Text style={styles.clientName}>{client.name}</Text>}
                                    {client.address && (
                                        <Text style={styles.clientAddress}>{client.address}</Text>
                                    )}
                                    {(client.city || client.province || client.zip) && (
                                        <Text style={styles.clientAddress}>
                                            {[client.city, client.province].filter(Boolean).join(', ')}{' '}
                                            {client.zip}
                                        </Text>
                                    )}
                                    {client.attention && (
                                        <Text style={styles.clientAttention}>Attn: {client.attention}</Text>
                                    )}
                                </View>
                            )}
                        </View>
                        <View style={styles.divider} />
                    </>
                )}

                {/* Summary */}
                <View style={styles.summaryRow}>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Total Amount</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(grandTotal)}</Text>
                    </View>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Total Hours</Text>
                        <Text style={styles.summaryValue}>{totalHours.toFixed(1)}</Text>
                    </View>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Projects</Text>
                        <Text style={styles.summaryValue}>{sections.length}</Text>
                    </View>
                </View>

                {/* Project Tables */}
                {sections.map((section) => (
                    <View key={section.projectName} style={styles.projectSection} wrap={false}>
                        <Text style={styles.projectName}>{section.projectName}</Text>

                        {/* Table Header */}
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeaderText, styles.colDescription]}>Description</Text>
                            <Text style={[styles.tableHeaderText, styles.colDate]}>Date</Text>
                            <Text style={[styles.tableHeaderText, styles.colRate]}>Rate</Text>
                            <Text style={[styles.tableHeaderText, styles.colHours]}>Hours</Text>
                            <Text style={[styles.tableHeaderText, styles.colAmount]}>Amount</Text>
                        </View>

                        {/* Table Rows */}
                        {section.items.map((item, i) => (
                            <View
                                key={i}
                                style={i % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}
                            >
                                <Text style={[styles.tableCellBold, styles.colDescription]}>
                                    {item.description}
                                </Text>
                                <Text style={[styles.tableCell, styles.colDate]}>
                                    {item.dateOfWork ? formatDate(item.dateOfWork) : '—'}
                                </Text>
                                <Text style={[styles.tableCell, styles.colRate]}>
                                    {formatCurrency(item.rate)}/hr
                                </Text>
                                <Text style={[styles.tableCell, styles.colHours]}>
                                    {item.hours.toFixed(1)}
                                </Text>
                                <Text style={[styles.tableCellBold, styles.colAmount]}>
                                    {formatCurrency(item.amount)}
                                </Text>
                            </View>
                        ))}

                        {/* Table Footer */}
                        <View style={styles.tableFooter}>
                            <Text style={[styles.tableCellBold, styles.colDescription]}>Subtotal</Text>
                            <Text style={[styles.tableCell, styles.colDate]} />
                            <Text style={[styles.tableCell, styles.colRate]} />
                            <Text style={[styles.tableCellBold, styles.colHours]}>
                                {section.totalHours.toFixed(1)}
                            </Text>
                            <Text style={[styles.tableCellBold, styles.colAmount]}>
                                {formatCurrency(section.total)}
                            </Text>
                        </View>
                    </View>
                ))}

                {/* Extra Notes */}
                {invoice.extraNotes && (
                    <View style={styles.notesSection}>
                        <Text style={styles.notesLabel}>Notes</Text>
                        <Text style={styles.notesText}>{invoice.extraNotes}</Text>
                    </View>
                )}

                {/* Grand Total */}
                <View style={styles.grandTotal}>
                    <Text style={styles.grandTotalLabel}>Grand Total</Text>
                    <Text style={styles.grandTotalValue}>{formatCurrency(grandTotal)}</Text>
                </View>
            </Page>
        </Document>
    );
}
