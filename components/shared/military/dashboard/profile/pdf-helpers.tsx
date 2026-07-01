import { Text, View } from "@react-pdf/renderer";
import { styles } from "./pdf-styles";
import type { Achievement, Equipment, MedicalRecord, PositionEntry } from "../../types";

export function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function InfoLine({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export function HistoryEntry({ entry }: { entry: PositionEntry }) {
  return (
    <View style={styles.historyItem}>
      <Text style={styles.historyBullet}>{"\u2022"}</Text>
      <View style={styles.historyContent}>
        <Text style={styles.historyPosition}>{entry.position}</Text>
        <Text style={styles.historyUnit}>{entry.unit}</Text>
        <Text style={styles.historyDates}>
          {entry.startDate}{entry.endDate ? ` — ${entry.endDate}` : " — зараз"}
        </Text>
      </View>
    </View>
  );
}

export function AchievementRow({ item }: { item: Achievement }) {
  const icon = item.type === "medal" ? "\u2605" : item.type === "commendation" ? "\u2709" : "\u2713";
  return (
    <View style={styles.historyItem}>
      <Text style={styles.historyBullet}>{icon}</Text>
      <View style={styles.historyContent}>
        <Text style={styles.historyPosition}>{item.name}</Text>
        <Text style={styles.historyDates}>{item.date}</Text>
      </View>
    </View>
  );
}

export function EquipmentRow({ item }: { item: Equipment }) {
  return (
    <View style={styles.historyItem}>
      <Text style={styles.historyBullet}>{"\u25A0"}</Text>
      <View style={styles.historyContent}>
        <Text style={styles.historyPosition}>{item.name}</Text>
        <Text style={styles.historyDates}>
          {item.serialNumber ? `№ ${item.serialNumber}  |  ` : ""}
          {item.issuedDate}
        </Text>
      </View>
    </View>
  );
}

export function MedicalRow({ item }: { item: MedicalRecord }) {
  return (
    <View style={styles.historyItem}>
      <Text style={styles.historyBullet}>{"\u25CF"}</Text>
      <View style={styles.historyContent}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.historyPosition}>{item.condition}</Text>
          <Text style={[styles.badge, item.status === "active" ? styles.badgeActive : styles.badgeResolved]}>
            {item.status === "active" ? "АКТИВНО" : "ВИЛІКУВАНО"}
          </Text>
        </View>
        <Text style={styles.historyDates}>{item.diagnosisDate}</Text>
      </View>
    </View>
  );
}
