'use client';

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font
} from '@react-pdf/renderer';

// Stilovi za PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica'
  },
  section: {
    marginBottom: 15
  },
  title: {
    fontSize: 18,
    marginBottom: 8,
    color: '#1e40af', // Indigo-700
    fontWeight: 'bold'
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 6,
    color: '#2563eb', // Blue-600
    fontWeight: 'bold'
  },
  text: {
    fontSize: 12,
    marginBottom: 4
  },
  highlight: {
    fontWeight: 'bold',
    color: '#10b981' // Green-500
  },
  list: {
    marginLeft: 12,
    marginBottom: 4
  }
});

interface AnalysisPDFProps {
  analysis: string;
}

export const AnalysisPDF = ({ analysis }: AnalysisPDFProps) => {
  // Parsiranje linija i osnovna stilizacija
  const lines = analysis.split('\n');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return <Text key={idx} style={styles.subtitle}>{line.replace('### ', '')}</Text>;
          } else if (line.startsWith('## ')) {
            return <Text key={idx} style={styles.title}>{line.replace('## ', '')}</Text>;
          } else if (line.startsWith('**') && line.endsWith('**')) {
            return <Text key={idx} style={styles.highlight}>{line.replace(/\*\*/g,'')}</Text>;
          } else if (line.startsWith('•')) {
            return <Text key={idx} style={styles.list}>• {line.replace('•','').trim()}</Text>;
          } else if (line.match(/^\d+\./)) {
            return <Text key={idx} style={styles.list}>{line.trim()}</Text>;
          } else if (line.trim() === '') {
            return <Text key={idx}>&nbsp;</Text>;
          } else {
            return <Text key={idx} style={styles.text}>{line}</Text>;
          }
        })}
      </Page>
    </Document>
  );
};
