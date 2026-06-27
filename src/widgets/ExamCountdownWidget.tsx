/**
 * ExamCountdownWidget.tsx
 * ─────────────────────────────────────────────
 * Android home-screen widget built with react-native-android-widget.
 *
 * ⚠️  IMPORTANT: Only components exported by react-native-android-widget
 * may be used here.  Standard React Native components (View, Text, Image,
 * StyleSheet, etc.) are NOT supported because the library renders by taking
 * a screenshot of a temporary off-screen React tree.
 *
 * Widget layout (4×2 cells, ~250 dp × 110 dp minimum):
 *
 *  ┌──────────────────────────────────────────┐
 *  │ 📚  NEXT EXAM                            │
 *  │                                          │
 *  │   COS 202                                │
 *  │   CBT  ·  4:30 PM – 5:30 PM             │
 *  │                                          │
 *  │  ┌──────┐  ┌──────┐  ┌──────┐           │
 *  │  │  11  │  │  06  │  │  43  │           │
 *  │  │ DAYS │  │  HRS │  │ MINS │           │
 *  │  └──────┘  └──────┘  └──────┘           │
 *  └──────────────────────────────────────────┘
 */

import React from 'react';
import {FlexWidget, TextWidget} from 'react-native-android-widget';
import type {ColorProp} from 'react-native-android-widget/lib/typescript/widgets/utils/style.props';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExamWidgetProps {
  courseCode: string;
  venue: string;
  timeString: string;
  days: number;
  hours: number;
  minutes: number;
  /** When true the widget shows "All exams done 🎉" */
  allDone?: boolean;
}

// ─── Colour tokens ────────────────────────────────────────────────────────────

// Must be typed as ColorProp so TS template-literal narrowing works
const BG: ColorProp = '#0D0F1A';
const SURFACE: ColorProp = '#161929';
const ACCENT: ColorProp = '#6C63FF';
const ACCENT_LIGHT: ColorProp = '#9B95FF';
const TEXT_WHITE: ColorProp = '#FFFFFF';
const TEXT_SUB: ColorProp = '#A0A8C0';
const TILE_SUB: ColorProp = '#7B84A3';

// ─── Sub-components ───────────────────────────────────────────────────────────

function CountdownTile({value, label}: {value: number; label: string}) {
  const display = String(value).padStart(2, '0');
  return (
    <FlexWidget
      style={{
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: SURFACE,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginHorizontal: 4,
        width: 52,
      }}>
      <TextWidget
        text={display}
        style={{
          fontSize: 22,
          fontWeight: 'bold',
          color: TEXT_WHITE,
          textAlign: 'center',
        }}
      />
      <TextWidget
        text={label}
        style={{
          fontSize: 9,
          color: TILE_SUB,
          textAlign: 'center',
        }}
      />
    </FlexWidget>
  );
}

// ─── Main Widget ──────────────────────────────────────────────────────────────

export function ExamCountdownWidget({
  courseCode,
  venue,
  timeString,
  days,
  hours,
  minutes,
  allDone = false,
}: ExamWidgetProps) {
  if (allDone) {
    return (
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: BG,
          borderRadius: 16,
        }}>
        <TextWidget
          text="All Exams Done!"
          style={{fontSize: 18, color: TEXT_WHITE, fontWeight: 'bold'}}
        />
        <TextWidget
          text="Congratulations!"
          style={{fontSize: 12, color: TEXT_SUB, marginTop: 4}}
        />
      </FlexWidget>
    );
  }

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: BG,
        borderRadius: 16,
        padding: 14,
      }}>
      {/* ── Header row ── */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: 'match_parent',
        }}>
        <TextWidget
          text="NEXT EXAM"
          style={{
            fontSize: 10,
            color: ACCENT_LIGHT,
            fontWeight: 'bold',
          }}
        />
        <TextWidget
          text="WithLove, Dave!"
          style={{
            fontSize: 8,
            color: TEXT_SUB,
            fontStyle: 'italic',
          }}
        />
      </FlexWidget>

      {/* ── Course info ── */}
      <FlexWidget
        style={{
          flexDirection: 'column',
          marginTop: 4,
        }}>
        <TextWidget
          text={courseCode}
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: TEXT_WHITE,
          }}
        />
        <TextWidget
          text={`${venue}  ·  ${timeString}`}
          style={{
            fontSize: 11,
            color: TEXT_SUB,
            marginTop: 2,
          }}
        />
      </FlexWidget>

      {/* ── Countdown tiles ── */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 8,
        }}>
        <CountdownTile value={days} label="DAYS" />
        <TextWidget
          text=":"
          style={{fontSize: 16, color: ACCENT, marginBottom: 10}}
        />
        <CountdownTile value={hours} label="HRS" />
        <TextWidget
          text=":"
          style={{fontSize: 16, color: ACCENT, marginBottom: 10}}
        />
        <CountdownTile value={minutes} label="MINS" />
      </FlexWidget>
    </FlexWidget>
  );
}
