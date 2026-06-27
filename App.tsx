/**
 * App.tsx — Exam Countdown with user-managed input
 * Countdown auto-refreshes every 30 seconds.
 */

import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  Animated,
  Easing,
  FlatList,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type {Exam} from './src/data/examSchedule';
import {getCountdown, getNextExam} from './src/utils/countdownUtils';
import {
  addExam,
  deleteExam,
  generateId,
  getExams,
  updateExam,
} from './src/data/examStorage';

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
  red: '#FF6B6B',
  border: 'rgba(255,255,255,0.06)',
  inputBg: '#1E2235',
  inputBorder: 'rgba(255,255,255,0.12)',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function CountdownTile({value, label}: {value: number; label: string}) {
  const displayVal = String(value).padStart(2, '0');
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.12, duration: 180,
        easing: Easing.out(Easing.quad), useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1, duration: 220,
        easing: Easing.in(Easing.quad), useNativeDriver: true,
      }),
    ]).start();
  }, [value, pulseAnim]);

  return (
    <View style={styles.tile}>
      <Animated.Text style={[styles.tileValue, {transform: [{scale: pulseAnim}]}]}>
        {displayVal}
      </Animated.Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

function ExamRow({
  exam, isNext, onEdit, onDelete,
}: {
  exam: Exam; isNext: boolean;
  onEdit: (e: Exam) => void; onDelete: (id: string) => void;
}) {
  const examDate = new Date(exam.date);
  const displayDate = examDate.toLocaleDateString('en-NG', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
  const countdown = getCountdown(exam);

  return (
    <View style={[styles.examRow, isNext && styles.examRowNext]}>
      {isNext && (
        <View style={styles.nextBadge}>
          <Text style={styles.nextBadgeText}>NEXT</Text>
        </View>
      )}
      <Pressable style={styles.examRowLeft} onPress={() => onEdit(exam)}>
        <Text style={styles.examCourseCode}>{exam.courseCode}</Text>
        <Text style={styles.examMeta}>{exam.venue}  ·  {exam.timeString}</Text>
        <Text style={styles.examDate}>{displayDate}</Text>
      </Pressable>
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
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => {
          Alert.alert('Delete Exam', `Remove ${exam.courseCode}?`, [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Delete', style: 'destructive', onPress: () => onDelete(exam.id)},
          ]);
        }}>
        <Text style={styles.deleteBtnText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Add/Edit Modal ───────────────────────────────────────────────────────────

interface FormData {
  courseCode: string;
  venue: string;
  timeString: string;
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
}

function ExamFormModal({
  visible, exam, onClose, onSave,
}: {
  visible: boolean; exam: Exam | null;
  onClose: () => void; onSave: (exam: Exam) => void;
}) {
  const isEdit = !!exam;

  const getInitial = useCallback((): FormData => {
    if (exam) {
      const d = new Date(exam.date);
      return {
        courseCode: exam.courseCode,
        venue: exam.venue,
        timeString: exam.timeString,
        year: String(d.getFullYear()),
        month: String(d.getMonth() + 1).padStart(2, '0'),
        day: String(d.getDate()).padStart(2, '0'),
        hour: String(d.getHours()).padStart(2, '0'),
        minute: String(d.getMinutes()).padStart(2, '0'),
      };
    }
    const now = new Date();
    return {
      courseCode: '', venue: '', timeString: '',
      year: String(now.getFullYear()),
      month: String(now.getMonth() + 1).padStart(2, '0'),
      day: '', hour: '09', minute: '00',
    };
  }, [exam]);

  const [form, setForm] = useState<FormData>(getInitial());

  useEffect(() => {
    if (visible) { setForm(getInitial()); }
  }, [visible, getInitial]);

  const update = (key: keyof FormData, val: string) =>
    setForm(prev => ({...prev, [key]: val}));

  const handleSave = () => {
    if (!form.courseCode.trim()) {
      Alert.alert('Missing', 'Course code is required'); return;
    }
    if (!form.day.trim() || !form.month.trim() || !form.year.trim()) {
      Alert.alert('Missing', 'Please fill in the date'); return;
    }

    const y = form.year;
    const m = form.month.padStart(2, '0');
    const d = form.day.padStart(2, '0');
    const h = form.hour.padStart(2, '0');
    const min = form.minute.padStart(2, '0');
    const dateStr = `${y}-${m}-${d}T${h}:${min}:00`;

    // Auto-generate timeString if empty
    let ts = form.timeString.trim();
    if (!ts) {
      const hNum = parseInt(h, 10);
      const ampm = hNum >= 12 ? 'PM' : 'AM';
      const h12 = hNum % 12 || 12;
      ts = `${h12}:${min} ${ampm}`;
    }

    onSave({
      id: exam?.id ?? generateId(),
      courseCode: form.courseCode.trim().toUpperCase(),
      date: dateStr,
      venue: form.venue.trim() || 'TBD',
      timeString: ts,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>
              {isEdit ? 'Edit Exam' : 'Add New Exam'}
            </Text>

            <Text style={styles.fieldLabel}>Course Code *</Text>
            <TextInput
              style={styles.input}
              value={form.courseCode}
              onChangeText={v => update('courseCode', v)}
              placeholder="e.g. COS 202"
              placeholderTextColor={C.mutedText}
              autoCapitalize="characters"
            />

            <Text style={styles.fieldLabel}>Venue</Text>
            <TextInput
              style={styles.input}
              value={form.venue}
              onChangeText={v => update('venue', v)}
              placeholder="e.g. CBT Hall"
              placeholderTextColor={C.mutedText}
            />

            <Text style={styles.fieldLabel}>Date *</Text>
            <View style={styles.dateRow}>
              <TextInput
                style={[styles.input, styles.dateInput]}
                value={form.day}
                onChangeText={v => update('day', v)}
                placeholder="DD"
                placeholderTextColor={C.mutedText}
                keyboardType="number-pad"
                maxLength={2}
              />
              <Text style={styles.dateSep}>/</Text>
              <TextInput
                style={[styles.input, styles.dateInput]}
                value={form.month}
                onChangeText={v => update('month', v)}
                placeholder="MM"
                placeholderTextColor={C.mutedText}
                keyboardType="number-pad"
                maxLength={2}
              />
              <Text style={styles.dateSep}>/</Text>
              <TextInput
                style={[styles.input, styles.yearInput]}
                value={form.year}
                onChangeText={v => update('year', v)}
                placeholder="YYYY"
                placeholderTextColor={C.mutedText}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>

            <Text style={styles.fieldLabel}>Time</Text>
            <View style={styles.dateRow}>
              <TextInput
                style={[styles.input, styles.dateInput]}
                value={form.hour}
                onChangeText={v => update('hour', v)}
                placeholder="HH"
                placeholderTextColor={C.mutedText}
                keyboardType="number-pad"
                maxLength={2}
              />
              <Text style={styles.dateSep}>:</Text>
              <TextInput
                style={[styles.input, styles.dateInput]}
                value={form.minute}
                onChangeText={v => update('minute', v)}
                placeholder="MM"
                placeholderTextColor={C.mutedText}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>

            <Text style={styles.fieldLabel}>Time Label (optional)</Text>
            <TextInput
              style={styles.input}
              value={form.timeString}
              onChangeText={v => update('timeString', v)}
              placeholder="e.g. 4:30 PM – 5:30 PM"
              placeholderTextColor={C.mutedText}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>
                  {isEdit ? 'Update' : 'Add Exam'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

function App(): React.JSX.Element {
  const [now, setNow] = useState(new Date());
  const [exams, setExams] = useState<Exam[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);

  // Load exams from storage
  useEffect(() => {
    getExams().then(data => {
      setExams(data);
      setLoading(false);
    });
  }, []);

  // Refresh countdown every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const nextExam = getNextExam(exams, now);
  const countdown = nextExam ? getCountdown(nextExam, now) : null;

  const handleAdd = () => {
    setEditingExam(null);
    setModalVisible(true);
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    const updated = await deleteExam(id);
    setExams(updated);
  };

  const handleSave = async (exam: Exam) => {
    let updated: Exam[];
    if (editingExam) {
      updated = await updateExam(exam);
    } else {
      updated = await addExam(exam);
    }
    setExams(updated);
    setModalVisible(false);
    setEditingExam(null);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={C.bg} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} translucent={false} />

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

      {/* ── Schedule header ── */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Full Schedule</Text>
        <Text style={styles.listCount}>{exams.length} exams</Text>
      </View>

      {/* ── Exam list ── */}
      {exams.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📝</Text>
          <Text style={styles.emptyText}>No exams added yet</Text>
          <Text style={styles.emptySub}>Tap + to add your first exam</Text>
        </View>
      ) : (
        <FlatList
          data={exams}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({item}) => (
            <ExamRow
              exam={item}
              isNext={item.id === nextExam?.id}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        />
      )}

      {/* ── FAB ── */}
      <TouchableOpacity style={styles.fab} onPress={handleAdd} activeOpacity={0.8}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* ── Form Modal ── */}
      <ExamFormModal
        visible={modalVisible}
        exam={editingExam}
        onClose={() => { setModalVisible(false); setEditingExam(null); }}
        onSave={handleSave}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: C.bg},
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  loadingText: {color: C.subtext, fontSize: 16},

  // Hero
  hero: {margin: 16, padding: 20, backgroundColor: C.surface, borderRadius: 20, borderWidth: 1, borderColor: C.border},
  heroHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: 10},
  heroEmojiLabel: {fontSize: 14, marginRight: 6},
  heroLabel: {fontSize: 11, color: C.accentLight, fontWeight: '700', letterSpacing: 2.5},
  heroCode: {fontSize: 32, fontWeight: '800', color: C.text, marginBottom: 4},
  heroVenue: {fontSize: 13, color: C.subtext, marginBottom: 20},
  tilesRow: {flexDirection: 'row', alignItems: 'center'},
  tile: {alignItems: 'center', justifyContent: 'center', backgroundColor: C.surfaceHigh, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, marginHorizontal: 5, minWidth: 70, borderWidth: 1, borderColor: C.border},
  tileValue: {fontSize: 30, fontWeight: '800', color: C.text},
  tileLabel: {fontSize: 9, color: C.mutedText, letterSpacing: 1.5, fontWeight: '600', marginTop: 2},
  colonSeparator: {fontSize: 22, color: C.accent, fontWeight: '700', marginBottom: 14},

  // All done
  allDoneContainer: {alignItems: 'center', paddingVertical: 16},
  allDoneEmoji: {fontSize: 40},
  allDoneText: {fontSize: 22, fontWeight: '800', color: C.text, marginTop: 8},
  allDoneSub: {fontSize: 14, color: C.subtext, marginTop: 4},

  // Empty state
  emptyContainer: {flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80},
  emptyEmoji: {fontSize: 48},
  emptyText: {fontSize: 18, fontWeight: '700', color: C.text, marginTop: 12},
  emptySub: {fontSize: 13, color: C.subtext, marginTop: 4},

  // List
  listHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginBottom: 8},
  listTitle: {fontSize: 16, fontWeight: '700', color: C.text},
  listCount: {fontSize: 12, color: C.subtext},
  listContent: {paddingHorizontal: 16, paddingBottom: 100},
  separator: {height: 1, backgroundColor: C.border},

  // Exam row
  examRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, backgroundColor: C.surface, borderRadius: 14, marginVertical: 4},
  examRowNext: {borderWidth: 1.5, borderColor: C.accent, backgroundColor: C.accentGlow},
  examRowLeft: {flex: 1},
  examRowRight: {marginLeft: 8},
  examCourseCode: {fontSize: 15, fontWeight: '700', color: C.text},
  examMeta: {fontSize: 12, color: C.subtext, marginTop: 2},
  examDate: {fontSize: 11, color: C.mutedText, marginTop: 2},
  miniCountdown: {fontSize: 11, fontWeight: '700', color: C.accentLight, letterSpacing: 0.5},
  nextBadge: {backgroundColor: C.accent, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginRight: 10},
  nextBadgeText: {fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 1},
  doneBadge: {backgroundColor: C.green + '30', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4},
  doneBadgeText: {fontSize: 10, fontWeight: '700', color: C.green, letterSpacing: 0.5},
  deleteBtn: {marginLeft: 10, padding: 6},
  deleteBtnText: {fontSize: 14, color: C.red, fontWeight: '700'},

  // FAB
  fab: {
    position: 'absolute', bottom: 28, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: C.accent, justifyContent: 'center',
    alignItems: 'center', elevation: 6,
    ...Platform.select({ios: {shadowColor: C.accent, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.4, shadowRadius: 8}}),
  },
  fabText: {fontSize: 28, color: '#fff', fontWeight: '600', marginTop: -2},

  // Modal
  modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end'},
  modalCard: {backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%'},
  modalTitle: {fontSize: 20, fontWeight: '800', color: C.text, marginBottom: 20, textAlign: 'center'},
  fieldLabel: {fontSize: 12, color: C.subtext, fontWeight: '600', marginBottom: 6, marginTop: 12, letterSpacing: 0.5},
  input: {backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.inputBorder, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: C.text, fontSize: 15},
  dateRow: {flexDirection: 'row', alignItems: 'center'},
  dateInput: {flex: 1},
  yearInput: {flex: 1.5},
  dateSep: {color: C.mutedText, fontSize: 18, marginHorizontal: 8},
  modalActions: {flexDirection: 'row', marginTop: 24, marginBottom: 16, gap: 12},
  cancelBtn: {flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: C.inputBorder, alignItems: 'center'},
  cancelBtnText: {color: C.subtext, fontSize: 15, fontWeight: '600'},
  saveBtn: {flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: C.accent, alignItems: 'center'},
  saveBtnText: {color: '#fff', fontSize: 15, fontWeight: '700'},
});

export default App;
