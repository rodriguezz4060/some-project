import { Document, Page, View, Text, StyleSheet, Image, Font } from "@react-pdf/renderer";
import type { BzvpPersonnel } from "../types";
import { font400, font500, font700 } from "../../military/dashboard/profile/profile-pdf-fonts";

Font.register({
  family: "Noto Sans",
  fonts: [
    { src: font400, fontWeight: 400 },
    { src: font500, fontWeight: 500 },
    { src: font700, fontWeight: 700 },
  ],
});

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
  heroRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
  },
  photoBox: {
    width: 100,
    height: 120,
    border: "1 solid #cbd5e1",
    borderRadius: 4,
  },
  photo: {
    width: 100,
    height: 120,
    borderRadius: 4,
  },
  heroInfo: {
    flex: 1,
    gap: 3,
  },
  fieldRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  fieldLabel: {
    width: 200,
    color: "#718096",
    fontSize: 9,
  },
  fieldValue: {
    flex: 1,
    fontSize: 9,
    fontWeight: "medium",
  },
  divider: {
    borderBottom: "1 solid #e2e8f0",
    marginVertical: 8,
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

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

interface Props {
  personnel: BzvpPersonnel;
}

export function BzvpPdfDocument({ personnel }: Props) {
  const generatedDate = new Date().toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>23 ОМБр</Text>
          <Text style={styles.headerSubtitle}>Облікова картка БЗВП</Text>
        </View>

        <View style={styles.heroRow}>
          {personnel.photo ? (
            <Image style={styles.photo} src={personnel.photo} alt="" />
          ) : (
            <View style={styles.photoBox} />
          )}
          <View style={styles.heroInfo}>
            <Field label="Військове звання" value={personnel.rank} />
            <Field label="ПІБ" value={personnel.fullName} />
            <Field
              label="Дата та місце народження"
              value={[personnel.birthDate, personnel.birthPlace].filter(Boolean).join(", ")}
            />
            <Field
              label="Серія та номер паспорту, коли і ким виданий"
              value={[personnel.passport, personnel.passportIssued].filter(Boolean).join(", ")}
            />
            <Field label="ІПН" value={personnel.tin} />
            <Field
              label="№ військового квитка, коли та ким виданий"
              value={[personnel.militaryId, personnel.militaryIdIssued].filter(Boolean).join(", ")}
            />
            <Field
              label="УБД та дата видачі"
              value={personnel.ubd === "Так" ? `Так, ${personnel.ubdDate}` : personnel.ubd}
            />
          </View>
        </View>

        <View style={styles.divider} />

        <Field
          label="Воєнна частина (В/ч) та роки проходження служби"
          value={[personnel.serviceUnit, personnel.serviceYears].filter(Boolean).join(", ")}
        />
        <Field label="Цивільна робота, фах" value={personnel.civilianJob} />
        <Field
          label="Які навчальні заклади закінчив, у якому році, спеціальність"
          value={personnel.education}
        />
        <Field label="Фактичне місце проживання" value={personnel.actualAddress} />
        <Field label="Місце прописки" value={personnel.registrationAddress} />
        <Field label="Посвідчення водія (категорія)" value={personnel.driverLicense} />
        <Field label="Судимість" value={personnel.criminalRecord} />
        <Field label="Приводи в поліцію / адмін-порушення" value={personnel.policeRecords} />
        <Field label="Склад сім'ї (члени родини), їх адреса проживання" value={personnel.family} />
        <Field
          label="Номера телефонів (особистий, близьких родичів)"
          value={[personnel.phone, personnel.relativePhones].filter(Boolean).join("; ")}
        />
        <Field label="Особисте розпорядження" value={personnel.personalOrder} />
        <Field label="Яким РТЦК та СП призваний" value={personnel.conscription} />
        <Field
          label="Стан здоров'я, скарги на здоров'я"
          value={[personnel.health, personnel.healthComplaints].filter(Boolean).join(". ")}
        />
        <Field label="Морально-психологічний стан" value={personnel.moralState} />
        <Field label="Група крові" value={personnel.bloodType} />
        <Field label="Розмір взуття" value={personnel.shoeSize} />
        <Field label="Особливі примітки" value={personnel.notes} />

        <View style={styles.footer}>
          <Text>23 ОМБр — Облікова картка БЗВП</Text>
          <Text>Згенеровано: {generatedDate}</Text>
        </View>
      </Page>
    </Document>
  );
}
