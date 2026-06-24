import { Document, Page, View, Text, StyleSheet, Font } from "@react-pdf/renderer";
import type {
  MilitaryPersonnel,
  Achievement,
  Equipment,
  MedicalRecord,
  PositionEntry,
} from "../../types";
import { font400, font500, font700 } from "./profile-pdf-fonts";
import { ALL_SECTIONS } from "./profile-pdf-sections";
import type { PdfSectionId } from "./profile-pdf-sections";

Font.register({
  family: "Noto Sans",
  fonts: [
    { src: font400, fontWeight: 400 },
    { src: font500, fontWeight: 500 },
    { src: font700, fontWeight: 700 },
  ],
});

const statusLabel: Record<string, string> = {
  active: "Активний",
  "on-mission": "На завданні",
  wounded: "Поранений",
  vacation: "Відпустка",
  reserve: "Резерв",
};

const styles = StyleSheet.create({
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

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function InfoLine({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function HistoryEntry({ entry }: { entry: PositionEntry }) {
  return (
    <View style={styles.historyItem}>
      <Text style={styles.historyBullet}>{"\u2022"}</Text>
      <View style={styles.historyContent}>
        <Text style={styles.historyPosition}>{entry.position}</Text>
        <Text style={styles.historyUnit}>{entry.unit}</Text>
        <Text style={styles.historyDates}>
          {entry.startDate}
          {entry.endDate ? ` — ${entry.endDate}` : " — зараз"}
        </Text>
      </View>
    </View>
  );
}

function AchievementRow({ item }: { item: Achievement }) {
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

function EquipmentRow({ item }: { item: Equipment }) {
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

function MedicalRow({ item }: { item: MedicalRecord }) {
  return (
    <View style={styles.historyItem}>
      <Text style={styles.historyBullet}>{"\u25CF"}</Text>
      <View style={styles.historyContent}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.historyPosition}>{item.condition}</Text>
          <Text
            style={[
              styles.badge,
              item.status === "active" ? styles.badgeActive : styles.badgeResolved,
            ]}
          >
            {item.status === "active" ? "АКТИВНО" : "ВИЛІКУВАНО"}
          </Text>
        </View>
        <Text style={styles.historyDates}>{item.diagnosisDate}</Text>
      </View>
    </View>
  );
}

interface Props {
  personnel: MilitaryPersonnel;
  sections?: PdfSectionId[];
}

export function ProfilePdfDocument({ personnel, sections = ALL_SECTIONS }: Props) {
  const generatedDate = new Date().toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>23 ОМБр</Text>
          <Text style={styles.headerSubtitle}>Особова справа військовослужбовця</Text>
        </View>

        {/* Personnel header */}
        <Text style={styles.name}>{personnel.fullName}</Text>
        <View style={styles.rankStatusRow}>
          <Text>{personnel.rank}</Text>
          <Text>{"\u00B7"}</Text>
          <Text>{statusLabel[personnel.status] ?? personnel.status}</Text>
        </View>
        <Text style={styles.unitText}>{personnel.unit}</Text>

        <View style={styles.divider} />

        {/* Personal info */}
        {sections.includes("personal") && (
          <>
            <SectionTitle>Основні дані</SectionTitle>
            <View style={styles.infoGrid}>
              <InfoLine label="Посада" value={personnel.position} />
              <InfoLine label="Підрозділ" value={personnel.unit} />
              <InfoLine label="Дата народження" value={personnel.birthDate} />
              <InfoLine label="Досвід" value={personnel.experience ? `${personnel.experience} років` : undefined} />
              <InfoLine label="Місії" value={personnel.missions?.toString()} />
              <InfoLine
                label="Останнє завдання"
                value={
                  personnel.lastActiveDays == null
                    ? undefined
                    : personnel.lastActiveDays === 0
                      ? "сьогодні"
                      : personnel.lastActiveDays === 1
                        ? "вчора"
                        : `${personnel.lastActiveDays} дн. тому`
                }
              />
            </View>
          </>
        )}

        {/* Contact */}
        {sections.includes("contacts") && (personnel.phone || personnel.email) && (
          <>
            <SectionTitle>Контакти</SectionTitle>
            {personnel.phone && (
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>Телефон</Text>
                <Text style={styles.contactValue}>{personnel.phone}</Text>
              </View>
            )}
            {personnel.email && (
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>{personnel.email}</Text>
              </View>
            )}
          </>
        )}

        {/* Position history */}
        {sections.includes("positionHistory") && personnel.positionHistory && personnel.positionHistory.length > 0 && (
          <>
            <SectionTitle>Історія посад</SectionTitle>
            {personnel.positionHistory.map((entry, i) => (
              <HistoryEntry key={i} entry={entry} />
            ))}
          </>
        )}

        {/* Achievements */}
        {sections.includes("achievements") && personnel.achievements && personnel.achievements.length > 0 && (
          <>
            <SectionTitle>Нагороди та відзнаки</SectionTitle>
            {personnel.achievements.map((item, i) => (
              <AchievementRow key={i} item={item} />
            ))}
          </>
        )}

        {/* Equipment */}
        {sections.includes("equipment") && personnel.equipment && personnel.equipment.length > 0 && (
          <>
            <SectionTitle>Майно держави</SectionTitle>
            {personnel.equipment.map((item, i) => (
              <EquipmentRow key={i} item={item} />
            ))}
          </>
        )}

        {/* Medical records */}
        {sections.includes("medical") && personnel.medicalRecords && personnel.medicalRecords.length > 0 && (
          <>
            <SectionTitle>Медичні записи</SectionTitle>
            {personnel.medicalRecords.map((item, i) => (
              <MedicalRow key={i} item={item} />
            ))}
          </>
        )}

        {/* Clothing sizes */}
        {sections.includes("clothingSizes") && personnel.clothingSizes && (
          <>
            <SectionTitle>Розміри одягу</SectionTitle>
            <View style={styles.clothingGrid}>
              {personnel.clothingSizes.height && (
                <View style={styles.clothingItem}>
                  <Text style={styles.clothingLabel}>Зріст</Text>
                  <Text style={styles.clothingValue}>{personnel.clothingSizes.height}</Text>
                </View>
              )}
              {personnel.clothingSizes.chest && (
                <View style={styles.clothingItem}>
                  <Text style={styles.clothingLabel}>Груди</Text>
                  <Text style={styles.clothingValue}>{personnel.clothingSizes.chest}</Text>
                </View>
              )}
              {personnel.clothingSizes.waist && (
                <View style={styles.clothingItem}>
                  <Text style={styles.clothingLabel}>Талія</Text>
                  <Text style={styles.clothingValue}>{personnel.clothingSizes.waist}</Text>
                </View>
              )}
              {personnel.clothingSizes.shoes && (
                <View style={styles.clothingItem}>
                  <Text style={styles.clothingLabel}>Взуття</Text>
                  <Text style={styles.clothingValue}>{personnel.clothingSizes.shoes}</Text>
                </View>
              )}
              {personnel.clothingSizes.headgear && (
                <View style={styles.clothingItem}>
                  <Text style={styles.clothingLabel}>Головний убір</Text>
                  <Text style={styles.clothingValue}>{personnel.clothingSizes.headgear}</Text>
                </View>
              )}
              {personnel.clothingSizes.uniform && (
                <View style={styles.clothingItem}>
                  <Text style={styles.clothingLabel}>Форма</Text>
                  <Text style={styles.clothingValue}>{personnel.clothingSizes.uniform}</Text>
                </View>
              )}
            </View>
          </>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>23 ОМБр — Особова справа</Text>
          <Text>Згенеровано: {generatedDate}</Text>
        </View>
      </Page>
    </Document>
  );
}
