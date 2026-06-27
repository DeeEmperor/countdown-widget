/**
 * App.tsx
 * ─────────────────────────────────────────────
 * In-app countdown preview screen. Mirrors the widget's data and design
 * using standard React Native components so you can validate the logic
 * without needing a home-screen widget.
 *
 * Countdown auto-refreshes every 30 seconds.
 */

import React, {useEffect, useState} from 'react';
import {
  Animated,
  Easing,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {EXAM_SCHEDULE, type Exam} from './src/data/examSchedule';
import {getCountdown, getNextExam} from './src/utils/countdownUtils';

// ─── Colour tokens ────────────────────────────────────────────────────────────

const C = {
  bg: '#0D0F1A',
  surface: '#161929',
  surfaceHigh: '#1E2235',
  accent: '#6C63FF',
  accentGlow: 'rgba(108,99,255,0.20)',
  accentLight: '#9B95FF',
  text: '#FFFFFF',
  subtext: '#A0A8C0',
  mutedText: '#555C7A',
  green: '#4ADE80',
  border: 'rgba(255,255,255,0.06)',
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface TileProps {
  value: number;
  label: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CountdownTile({value, label}: TileProps) {
  const displayVal = String(value).padStart(2, '0');
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Subtle pulse every minute change
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.12,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 220,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [value, pulseAnim]);

  return (
    <View style={styles.tile}>
      <Animated.Text
        style={[styles.tileValue, {transform: [{scale: pulseAnim}]}]}>
        {displayVal}
      </Animated.Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

function ExamRow({exam, isNext}: {exam: Exam; isNext: boolean}) {
  const examDate = new Date(exam.date);
  const displayDate = examDate.toLocaleDateString('en-NG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const countdown = getCountdown(exam);

  return (
    <View
      style={[
        styles.examRow,
        isNext && styles.examRowNext,
      ]}>
      {isNext && (
        <View style={styles.nextBadge}>
          <Text style={styles.nextBadgeText}>NEXT</Text>
        </View>
      )}
      <View style={styles.examRowLeft}>
        <Text style={styles.examCourseCode}>{exam.courseCode}</Text>
        <Text style={styles.examMeta}>
          {exam.venue}  ·  {exam.timeString}
        </Text>
        <Text style={styles.examDate}>{displayDate}</Text>
      </View>
      {!countdown.isPast && (
        <View style={styles.examRowRight}>
          <Text style={styles.miniCountdown}>
            {String(countdown.days).padStart(2, '0')}d{' '}
            {String(countdown.hours).padStart(2, '0')}h{' '}
            {String(countdown.minutes).padStart(2, '0')}m
          </Text>
        </View>
      )}
      {countdown.isPast && (
        <View style={styles.doneBadge}>
          <Text style={styles.doneBadgeText}>DONE ✓</Text>
        </View>
      )}
    </View>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

function App(): React.JSX.Element {
  const [now, setNow] = useState(new Date());

  // Refresh countdown every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const nextExam = getNextExam(EXAM_SCHEDULE, now);
  const countdown = nextExam ? getCountdown(nextExam, now) : null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={C.bg}
        translucent={false}
      />

      {/* ── Hero countdown card ── */}
      <View style={styles.hero}>
        <View style={styles.heroHeader}>
          <Text style={styles.heroEmojiLabel}>📚</Text>
          <Text style={styles.heroLabel}>NEXT EXAM</Text>
        </View>

        {nextExam && countdown ? (
          <>
            <Text style={styles.heroCode}>{nextExam.courseCode}</Text>
            <Text style={styles.heroVenue}>
              {nextExam.venue}  ·  {nextExam.timeString}
            </Text>

            <View style={styles.tilesRow}>
              <CountdownTile value={countdown.days} label="DAYS" />
              <Text style={styles.colonSeparator}>:</Text>
              <CountdownTile value={countdown.hours} label="HRS" />
              <Text style={styles.colonSeparator}>:</Text>
              <CountdownTile value={countdown.minutes} label="MINS" />
            </View>
          </>
        ) : (
          <View style={styles.allDoneContainer}>
            <Text style={styles.allDoneEmoji}>🎉</Text>
            <Text style={styles.allDoneText}>All Exams Done!</Text>
            <Text style={styles.allDoneSub}>Congratulations!</Text>
          </View>
        )}
      </View>

      {/* ── Full schedule list ── */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Full Schedule</Text>
        <Text style={styles.listCount}>{EXAM_SCHEDULE.length} exams</Text>
      </View>

      <FlatList
        data={EXAM_SCHEDULE}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({item}) => (
          <ExamRow exam={item} isNext={item.id === nextExam?.id} />
        )}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // Hero card
  hero: {
    margin: 16,
    padding: 20,
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  heroEmojiLabel: {
    fontSize: 14,
    marginRight: 6,
  },
  heroLabel: {
    fontSize: 11,
    color: C.accentLight,
    fontWeight: '700',
    letterSpacing: 2.5,
  },
  heroCode: {
    fontSize: 32,
    fontWeight: '800',
    color: C.text,
    marginBottom: 4,
  },
  heroVenue: {
    fontSize: 13,
    color: C.subtext,
    marginBottom: 20,
  },
  tilesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.surfaceHigh,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 5,
    minWidth: 70,
    borderWidth: 1,
    borderColor: C.border,
  },
  tileValue: {
    fontSize: 30,
    fontWeight: '800',
    color: C.text,
  },
  tileLabel: {
    fontSize: 9,
    color: C.mutedText,
    letterSpacing: 1.5,
    fontWeight: '600',
    marginTop: 2,
  },
  colonSeparator: {
    fontSize: 22,
    color: C.accent,
    fontWeight: '700',
    marginBottom: 14,
  },

  // All done
  allDoneContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  allDoneEmoji: {
    fontSize: 40,
  },
  allDoneText: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
    marginTop: 8,
  },
  allDoneSub: {
    fontSize: 14,
    color: C.subtext,
    marginTop: 4,
  },

  // List
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  listCount: {
    fontSize: 12,
    color: C.subtext,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  separator: {
    height: 1,
    backgroundColor: C.border,
  },

  // Exam row
  examRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: C.surface,
    borderRadius: 14,
    marginVertical: 4,
  },
  examRowNext: {
    borderWidth: 1.5,
    borderColor: C.accent,
    backgroundColor: C.accentGlow,
  },
  examRowLeft: {
    flex: 1,
  },
  examRowRight: {
    marginLeft: 8,
  },
  examCourseCode: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
  },
  examMeta: {
    fontSize: 12,
    color: C.subtext,
    marginTop: 2,
  },
  examDate: {
    fontSize: 11,
    color: C.mutedText,
    marginTop: 2,
  },
  miniCountdown: {
    fontSize: 11,
    fontWeight: '700',
    color: C.accentLight,
    letterSpacing: 0.5,
  },
  nextBadge: {
    backgroundColor: C.accent,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 10,
  },
  nextBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  doneBadge: {
    backgroundColor: C.green + '30',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  doneBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: C.green,
    letterSpacing: 0.5,
  },
});

export default App;
