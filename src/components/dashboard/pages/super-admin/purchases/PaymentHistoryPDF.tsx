import { IPurchase, IPurchasePayment } from "@/redux/api/purchase/purchaseApi";
import { formatStatusText } from "@/utils/formatStatusText";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { format } from "date-fns";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    color: "#334155",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
    letterSpacing: 1,
  },
  subtitle: { fontSize: 10, color: "#64748b", marginTop: 4 },
  companyDetails: { alignItems: "flex-end" },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  logo: {
    width: 130,
    height: 42,
    objectFit: "contain",
    objectPosition: "right",
    marginBottom: 10,
  },
  section: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  box: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    width: "48%",
  },
  boxTitle: {
    fontSize: 9,
    color: "#94a3b8",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "bold",
  },
  label: { fontSize: 10, color: "#64748b" },
  value: { fontSize: 10, color: "#334155", fontWeight: "bold" },

  table: { width: "100%", marginTop: 20 },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    borderBottomStyle: "solid",
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableHeaderCell: { fontSize: 9, fontWeight: "bold", color: "#0f172a" },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    borderBottomStyle: "solid",
  },
  tableCell: { fontSize: 9, color: "#334155" },

  col1: { width: "15%" }, // Date
  col2: { width: "20%" }, // Method
  col3: { width: "45%" }, // Note
  col4: { width: "20%", textAlign: "right" }, // Amount

  summaryBox: { marginTop: 30, alignItems: "flex-end" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 250,
    paddingVertical: 4,
  },
  summaryLabel: { fontSize: 10, color: "#64748b" },
  summaryValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 250,
    paddingVertical: 8,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  totalLabel: { fontSize: 11, fontWeight: "bold", color: "#0f172a" },
  totalValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0089A7",
    textAlign: "right",
  },

  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 10,
  },
});

interface PaymentHistoryPDFProps {
  purchase: IPurchase;
  payments: IPurchasePayment[];
}

export default function PaymentHistoryPDF({
  purchase,
  payments,
}: PaymentHistoryPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>PAYMENT HISTORY</Text>
            <Text style={styles.subtitle}>
              Purchase No: {purchase.purchaseNo}
            </Text>
            <Text style={styles.subtitle}>
              Report Date: {format(new Date(), "dd MMM, yyyy")}
            </Text>
          </View>
          <View style={styles.companyDetails}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src="/brand-logo.png" style={styles.logo} />
            <Text style={styles.subtitle}>Rampura, Dhaka, Bangladesh</Text>
            <Text style={styles.subtitle}>raantechbd@gmail.com</Text>
            <Text style={styles.subtitle}>+880 135 037 9555</Text>
            <Text style={styles.subtitle}>+880 160 560 0997</Text>
          </View>
        </View>

        {/* Info Sections */}
        <View style={styles.section}>
          {/* Supplier Info */}
          <View style={styles.box}>
            <Text style={styles.boxTitle}>Supplier Details</Text>
            <Text style={{ ...styles.value, fontSize: 12, marginBottom: 4 }}>
              {purchase.supplier?.name || "N/A"}
            </Text>
            {purchase.supplier?.company && (
              <Text style={{ ...styles.label, marginBottom: 2 }}>
                {purchase.supplier.company}
              </Text>
            )}
            <Text style={styles.label}>{purchase.supplier?.phone || ""}</Text>
          </View>

          {/* Payment Status Info */}
          <View style={styles.box}>
            <Text style={styles.boxTitle}>Payment Summary</Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <Text style={styles.label}>Payment Status:</Text>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "bold",
                  color:
                    purchase.paymentStatus === "PAID"
                      ? "#10b981"
                      : purchase.paymentStatus === "PARTIAL"
                        ? "#f59e0b"
                        : "#f43f5e",
                }}
              >
                {formatStatusText(purchase.paymentStatus)}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <Text style={styles.label}>Total Billed:</Text>
              <Text
                style={{ fontSize: 10, fontWeight: "bold", color: "#334155" }}
              >
                Tk {purchase.totalAmount.toLocaleString()}
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={styles.label}>Total Due:</Text>
              <Text
                style={{ fontSize: 10, fontWeight: "bold", color: "#ef4444" }}
              >
                Tk {purchase.dueAmount.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Transactions Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.col1]}>Date</Text>
            <Text style={[styles.tableHeaderCell, styles.col2]}>Method</Text>
            <Text style={[styles.tableHeaderCell, styles.col3]}>Note</Text>
            <Text style={[styles.tableHeaderCell, styles.col4]}>Amount</Text>
          </View>

          {/* Table Body */}
          {payments.map((payment, index) => (
            <View key={payment._id || index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col1]}>
                {format(
                  new Date(payment.paymentDate || payment.createdAt),
                  "dd MMM yyyy",
                )}
              </Text>
              <Text
                style={[styles.tableCell, styles.col2, { fontWeight: "bold" }]}
              >
                {formatStatusText(payment.paymentMethod)}
              </Text>
              <Text
                style={[styles.tableCell, styles.col3, { color: "#64748b" }]}
              >
                {payment.note || "-"}
              </Text>
              <Text
                style={[styles.tableCell, styles.col4, { fontWeight: "bold" }]}
              >
                Tk {payment.amount.toLocaleString()}
              </Text>
            </View>
          ))}

          {payments.length === 0 && (
            <View style={{ padding: 20, textAlign: "center" }}>
              <Text style={{ fontSize: 10, color: "#94a3b8" }}>
                No payment transactions found.
              </Text>
            </View>
          )}
        </View>

        {/* Summary Footer */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount:</Text>
            <Text style={styles.summaryValue}>
              Tk {purchase.totalAmount.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Paid:</Text>
            <Text style={{ ...styles.summaryValue, color: "#10b981" }}>
              Tk {purchase.paidAmount.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Current Due:</Text>
            <Text style={{ ...styles.summaryValue, color: "#ef4444" }}>
              Tk {purchase.dueAmount.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Footer Text */}
        <Text style={styles.footer}>
          This is a computer-generated payment history report and does not
          require a signature.
        </Text>
      </Page>
    </Document>
  );
}
