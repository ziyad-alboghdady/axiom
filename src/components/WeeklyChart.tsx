import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Polyline, Circle, Line } from "react-native-svg";
import { C } from "../constants/colors";
import { useI18n } from "../i18n";

interface WeeklyChartProps {
  data: number[];
  maxValue?: number;
  height?: number;
}

export function WeeklyChart({ data, maxValue = 15, height = 180 }: WeeklyChartProps) {
  const { tx, language } = useI18n();
  const width = 320;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding;

  // Normalize data points to chart coordinates
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const normalizedValue = Math.min(value / maxValue, 1);
    const y = padding + chartHeight - normalizedValue * chartHeight;
    return { x, y, value };
  });

  // Days of week labels
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayLabels = data.length === 7 ? days : Array.from({ length: data.length }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString(language === "tr" ? "tr-TR" : "en-US", { weekday: "short" });
  });

  // Get color based on value
  const getColor = (value: number) => {
    const pct = value / maxValue;
    if (pct < 0.4) return C.mint;
    if (pct < 0.7) return C.gold;
    return C.coral;
  };

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{tx("Weekly CO₂ Trend", "Haftalık CO₂ Trendi")}</Text>

      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Y-axis grid lines */}
        <Line x1={padding} y1={padding} x2={padding} y2={padding + chartHeight} stroke="rgba(230,194,122,0.1)" strokeWidth={1} />

        {/* X-axis */}
        <Line x1={padding} y1={padding + chartHeight} x2={width - padding} y2={padding + chartHeight} stroke="rgba(230,194,122,0.1)" strokeWidth={1} />

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <Line
            key={`grid-${i}`}
            x1={padding}
            y1={padding + (1 - ratio) * chartHeight}
            x2={width - padding}
            y2={padding + (1 - ratio) * chartHeight}
            stroke="rgba(230,194,122,0.08)"
            strokeWidth={1}
            strokeDasharray="3,3"
          />
        ))}

        {/* Line path */}
        <Polyline
          points={polylinePoints}
          stroke={C.gold}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((point, i) => (
          <Circle
            key={`dot-${i}`}
            cx={point.x}
            cy={point.y}
            r={4.5}
            fill={getColor(point.value)}
            stroke={C.bg}
            strokeWidth={1.5}
          />
        ))}
      </Svg>

      {/* Day labels */}
      <View style={styles.labelsRow}>
        {dayLabels.map((day, i) => (
          <View key={`label-${i}`} style={styles.labelCol}>
            <Text style={styles.dayLabel}>{day}</Text>
            <Text style={[styles.valueLabel, { color: getColor(data[i]) }]}>
              {data[i].toFixed(1)}
            </Text>
          </View>
        ))}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: C.mint }]} />
          <Text style={styles.legendText}>{tx("Low (<40%)", "Düşük (<40%)")}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: C.gold }]} />
          <Text style={styles.legendText}>{tx("Moderate", "Orta")}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: C.coral }]} />
          <Text style={styles.legendText}>{tx("High (>70%)", "Yüksek (>70%)")}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.cardDark,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "rgba(230,194,122,0.12)",
    padding: 20,
    shadowColor: "#0A2E1F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    color: C.text,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 16,
    letterSpacing: 0.1,
  },
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingHorizontal: 4,
  },
  labelCol: {
    alignItems: "center",
    flex: 1,
  },
  dayLabel: {
    color: C.textMuted,
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  valueLabel: {
    fontSize: 11,
    fontWeight: "700",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(230,194,122,0.1)",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: C.textMuted,
    fontSize: 10,
    fontWeight: "600",
  },
});
