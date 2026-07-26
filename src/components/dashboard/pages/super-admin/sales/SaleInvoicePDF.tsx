import { ISale } from "@/redux/api/sale/salesApi";
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
    padding: 30,
    fontFamily: "Helvetica",
    color: "#334155",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  title: {
    fontSize: 22,
    fontWeight: "black",
    color: "#0f172a",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  textRow: { marginBottom: 3, fontSize: 10, color: "#64748b" },
  label: { fontSize: 10, color: "#64748b" },
  value: { fontSize: 10, color: "#334155", fontWeight: "bold" },
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
  table: { width: "100%", marginBottom: 20 },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableHeaderCell: { color: "#0f172a", fontSize: 10, fontWeight: "bold" },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
    paddingVertical: 8,
  },
  col1: { width: "40%" },
  col2: { width: "20%", textAlign: "center" },
  col3: { width: "20%", textAlign: "right" },
  col4: { width: "20%", textAlign: "right" },
  productName: {
    color: "#334155",
    marginBottom: 3,
    fontSize: 10,
    fontWeight: "bold",
  },
  productSku: { fontSize: 8, color: "#94a3b8" },
  summary: { width: "45%", alignSelf: "flex-end", marginTop: 5 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  summaryLabel: { fontSize: 10, color: "#64748b" },
  summaryValue: { fontSize: 10, color: "#334155", fontWeight: "bold" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    marginBottom: 6,
  },
  totalLabel: { color: "#0f172a", fontSize: 11, fontWeight: "bold" },
  totalValue: { color: "#0089A7", fontSize: 11, fontWeight: "bold" },
  paidDueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  paidColor: { color: "#10b981", fontSize: 10, fontWeight: "bold" },
  dueColor: { color: "#f43f5e", fontSize: 10, fontWeight: "bold" },
  footer: { marginTop: 30 },
  noteLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  noteText: { fontSize: 10, color: "#64748b" },
  signatures: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 50,
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
    paddingTop: 6,
    width: 140,
  },
  signatureText: { fontSize: 9, color: "#64748b", textAlign: "center" },
});

export const SaleInvoicePDF = ({ sale }: { sale: ISale }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>INVOICE</Text>
          <Text style={styles.textRow}>
            <Text style={styles.label}>Order No: </Text>
            <Text style={styles.value}>{sale.saleNo}</Text>
          </Text>
          <Text style={styles.textRow}>
            <Text style={styles.label}>Date: </Text>
            <Text style={styles.value}>
              {format(new Date(sale.createdAt), "dd MMM, yyyy")}
            </Text>
          </Text>
        </View>
        <View style={styles.companyDetails}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src="/brand-logo.png" style={styles.logo} />
          <Text style={styles.textRow}>Rampura, Dhaka, Bangladesh</Text>
          <Text style={styles.textRow}>raantechbd@gmail.com</Text>
          <Text style={styles.textRow}>+880 135 037 9555</Text>
          <Text style={styles.textRow}>+880 160 560 0997</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.box}>
          <Text style={styles.boxTitle}>Customer Details</Text>
          <Text
            style={{
              color: "#0f172a",
              fontSize: 11,
              fontWeight: "bold",
              marginBottom: 4,
            }}
          >
            {sale.customer?.name}
          </Text>
          <Text style={{ fontSize: 9, color: "#64748b", marginBottom: 2 }}>
            {sale.customer?.phone || "N/A"}
          </Text>
          <Text style={{ fontSize: 9, color: "#64748b" }}>
            {sale.customer?.address || "No Address"}
          </Text>
        </View>
        <View style={styles.box}>
          <Text style={styles.boxTitle}>Payment & Order Details</Text>
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
                  sale.paymentStatus === "PAID"
                    ? "#10b981"
                    : sale.paymentStatus === "PARTIAL"
                      ? "#f59e0b"
                      : "#f43f5e",
              }}
            >
              {formatStatusText(sale.paymentStatus)}
            </Text>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}
          >
            <Text style={styles.label}>Order Status:</Text>
            <Text
              style={{ fontSize: 10, fontWeight: "bold", color: "#334155" }}
            >
              {formatStatusText(sale.status)}
            </Text>
          </View>
          {sale.courierDetails && (
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={styles.label}>Courier:</Text>
              <Text
                style={{ fontSize: 10, fontWeight: "bold", color: "#334155" }}
              >
                {sale.courierDetails}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.col1, styles.tableHeaderCell]}>
            Product Description
          </Text>
          <Text style={[styles.col2, styles.tableHeaderCell]}>Qty</Text>
          <Text style={[styles.col3, styles.tableHeaderCell]}>Price</Text>
          <Text style={[styles.col4, styles.tableHeaderCell]}>Total</Text>
        </View>
        {sale.items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={styles.col1}>
              <Text style={styles.productName}>
                {item.product?.name || "Unknown Product"}
              </Text>
              <Text style={styles.productSku}>
                SKU: {item.product?.sku || "N/A"}
              </Text>
            </View>
            <Text style={[styles.col2, { fontSize: 10, color: "#334155" }]}>
              {item.quantity}
            </Text>
            <Text style={[styles.col3, { fontSize: 10, color: "#334155" }]}>
              Tk {item.unitPrice.toLocaleString()}
            </Text>
            <Text
              style={[
                styles.col4,
                { fontSize: 10, fontWeight: "bold", color: "#0f172a" },
              ]}
            >
              Tk {item.total.toLocaleString()}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal:</Text>
          <Text style={styles.summaryValue}>
            Tk {sale.subTotal.toLocaleString()}
          </Text>
        </View>
        {sale.shippingCharge > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping:</Text>
            <Text style={styles.summaryValue}>
              Tk {sale.shippingCharge.toLocaleString()}
            </Text>
          </View>
        )}
        {sale.discount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount:</Text>
            <Text
              style={{ fontSize: 10, fontWeight: "bold", color: "#f43f5e" }}
            >
              - Tk {sale.discount.toLocaleString()}
            </Text>
          </View>
        )}
        {sale.tax > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax:</Text>
            <Text style={styles.summaryValue}>
              + Tk {sale.tax.toLocaleString()}
            </Text>
          </View>
        )}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalValue}>
            Tk {sale.totalAmount.toLocaleString()}
          </Text>
        </View>

        <View style={styles.paidDueRow}>
          <Text style={styles.summaryLabel}>Paid Amount:</Text>
          <Text style={styles.paidColor}>
            Tk {sale.paidAmount.toLocaleString()}
          </Text>
        </View>
        <View style={styles.paidDueRow}>
          <Text style={styles.summaryLabel}>Due Amount:</Text>
          <Text style={styles.dueColor}>
            Tk {sale.dueAmount.toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.noteLabel}>Note:</Text>
          <Text style={styles.noteText}>{sale.note || "N/A"}</Text>
        </View>

        <View style={styles.signatures}>
          <View style={styles.signatureLine}>
            <Text style={styles.signatureText}>Customer Signature</Text>
          </View>
          <View style={styles.signatureLine}>
            <Text style={styles.signatureText}>Authorized Signature</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);
