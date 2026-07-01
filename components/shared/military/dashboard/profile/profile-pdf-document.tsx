import { Document, Page, View, Text, Font } from "@react-pdf/renderer";
import type { MilitaryPersonnel } from "../../types";
import { ALL_SECTIONS } from "./profile-pdf-sections";
import type { PdfSectionId } from "./profile-pdf-sections";
import { styles } from "./pdf-styles";
import { SectionTitle, InfoLine, HistoryEntry, AchievementRow, EquipmentRow, MedicalRow } from "./pdf-helpers";

Font.register({
  family: "Noto Sans",
  fonts: [
    { src: "/fonts/NotoSans-Regular.woff", fontWeight: 400 },
    { src: "/fonts/NotoSans-Medium.woff", fontWeight: 500 },
    { src: "/fonts/NotoSans-Bold.woff", fontWeight: 700 },
  ],
});

const statusLabel: Record<string, string> = {
  active: "Активний",
  "on-mission": "На завданні",
  wounded: "Поранений",
  vacation: "Відпустка",
  reserve: "Резерв",
};

interface Props {
  personnel: MilitaryPersonnel;
  sections?: PdfSectionId[];
  generatedDate?: string;
}

export function ProfilePdfDocument({ personnel, sections = ALL_SECTIONS, generatedDate }: Props) {
  const date =
    generatedDate ??
    new Date().toLocaleDateString("uk-UA", {
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
            {personnel.positionHistory.map((entry) => (
              <HistoryEntry key={entry.position + entry.startDate} entry={entry} />
            ))}
          </>
        )}

        {/* Achievements */}
        {sections.includes("achievements") && personnel.achievements && personnel.achievements.length > 0 && (
          <>
            <SectionTitle>Нагороди та відзнаки</SectionTitle>
            {personnel.achievements.map((item) => (
              <AchievementRow key={item.name + item.date} item={item} />
            ))}
          </>
        )}

        {/* Equipment */}
        {sections.includes("equipment") && personnel.equipment && personnel.equipment.length > 0 && (
          <>
            <SectionTitle>Майно держави</SectionTitle>
            {personnel.equipment.map((item) => (
              <EquipmentRow key={item.name + (item.serialNumber ?? "")} item={item} />
            ))}
          </>
        )}

        {/* Medical records */}
        {sections.includes("medical") && personnel.medicalRecords && personnel.medicalRecords.length > 0 && (
          <>
            <SectionTitle>Медичні записи</SectionTitle>
            {personnel.medicalRecords.map((item) => (
              <MedicalRow key={item.condition + item.diagnosisDate} item={item} />
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
          <Text>Згенеровано: {date}</Text>
        </View>
      </Page>
    </Document>
  );
}
