import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { TailoredResume } from "@/types";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 18,
    marginBottom: 4,
    fontFamily: "Helvetica-Bold",
  },
  subtitle: {
    fontSize: 9,
    color: "#555",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginTop: 10,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 2,
  },
  paragraph: {
    marginBottom: 6,
    lineHeight: 1.4,
  },
  bullet: {
    marginLeft: 12,
    marginBottom: 3,
    lineHeight: 1.35,
  },
  skillChip: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 4,
  },
  skill: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 4,
  },
  watermark: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%) rotate(-45deg)",
    fontSize: 48,
    color: "#e0e0e0",
    fontFamily: "Helvetica-Bold",
  },
});

interface Props {
  resume: TailoredResume;
  template?: string;
  addWatermark?: boolean;
}

export function ResumePDFDocument({ resume, addWatermark = false }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {addWatermark && (
          <View style={styles.watermark} fixed>
            <Text>ResumeAI</Text>
          </View>
        )}
        <View>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.paragraph}>{resume.summary}</Text>
        </View>

        <View>
          <Text style={styles.sectionTitle}>Experience</Text>
          {resume.experience?.map((exp, i) => (
            <View key={i} style={{ marginBottom: 8 }}>
              <Text style={styles.title}>{exp.title}</Text>
              <Text style={styles.subtitle}>
                {exp.company} · {exp.duration}
              </Text>
              {exp.bullets?.map((b, j) => (
                <Text key={j} style={styles.bullet}>
                  • {b}
                </Text>
              ))}
            </View>
          ))}
        </View>

        <View>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillChip}>
            {resume.skills?.map((s, i) => (
              <Text key={i} style={styles.skill}>
                {s}
              </Text>
            ))}
          </View>
        </View>

        <View>
          <Text style={styles.sectionTitle}>Education</Text>
          {resume.education?.map((ed, i) => (
            <View key={i} style={{ marginBottom: 4 }}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>{ed.degree}</Text>
              <Text style={styles.subtitle}>
                {ed.institution} · {ed.year}
              </Text>
            </View>
          ))}
        </View>

        {resume.certifications && resume.certifications.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {resume.certifications.map((c, i) => (
              <Text key={i} style={styles.bullet}>
                • {c}
              </Text>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
