import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Noto Sans",
    fontSize: 10,
    lineHeight: 1.4,
    color: "#1a1a1a",
  },
  headerBar: {
    backgroundColor: "#1a365d",
    padding: "8 16",
    marginBottom: 16,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: "#90cdf4",
    fontSize: 8,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1a365d",
    borderBottom: "1 solid #e2e8f0",
    paddingBottom: 4,
    marginBottom: 8,
    marginTop: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  rankStatusRow: {
    flexDirection: "row",
    gap: 8,
    fontSize: 11,
    color: "#4a5568",
    marginBottom: 4,
  },
  unitText: {
    fontSize: 10,
    color: "#718096",
    marginBottom: 8,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  infoItem: {
    width: "48%",
    flexDirection: "row",
    marginBottom: 2,
  },
  infoLabel: {
    width: 80,
    color: "#718096",
    fontSize: 9,
  },
  infoValue: {
    fontSize: 9,
    fontWeight: "medium",
  },
  divider: {
    borderBottom: "1 solid #e2e8f0",
    marginVertical: 8,
  },
  contactRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 2,
  },
  contactLabel: {
    color: "#718096",
    fontSize: 9,
    width: 50,
  },
  contactValue: {
    fontSize: 9,
  },
  historyItem: {
    flexDirection: "row",
    marginBottom: 6,
  },
  historyBullet: {
    width: 8,
    fontSize: 10,
    color: "#1a365d",
    marginTop: 1,
  },
  historyContent: {
    flex: 1,
  },
  historyPosition: {
    fontSize: 9,
    fontWeight: "bold",
  },
  historyUnit: {
    fontSize: 8,
    color: "#718096",
  },
  historyDates: {
    fontSize: 8,
    color: "#a0aec0",
  },
  badge: {
    fontSize: 8,
    padding: "2 6",
    borderRadius: 2,
    marginLeft: 6,
  },
  badgeActive: {
    backgroundColor: "#fef2f2",
    color: "#dc2626",
  },
  badgeResolved: {
    backgroundColor: "#f0fdf4",
    color: "#16a34a",
  },
  emptyText: {
    fontSize: 9,
    color: "#a0aec0",
    fontStyle: "italic",
  },
  clothingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  clothingItem: {
    width: "30%",
    marginBottom: 2,
  },
  clothingLabel: {
    fontSize: 8,
    color: "#718096",
  },
  clothingValue: {
    fontSize: 9,
    fontWeight: "medium",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: "#a0aec0",
    borderTop: "1 solid #e2e8f0",
    paddingTop: 6,
  },
});
