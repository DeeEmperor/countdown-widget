/**
 * widgetTaskHandler.tsx
 * ─────────────────────────────────────────────
 * Registers the headless JS task handler that react-native-android-widget
 * calls whenever the widget needs to be rendered or updated.
 *
 * Lifecycle actions handled:
 *   WIDGET_ADDED   – user pins the widget to the home screen
 *   WIDGET_UPDATE  – system / WorkManager periodic refresh
 *   WIDGET_RESIZED – user resizes the widget cell
 *   WIDGET_DELETED – user removes the widget (cleanup only)
 *   WIDGET_CLICK   – user taps the widget (opens the app)
 *
 * The correct API is:
 *   props.renderWidget(<JSX />) — not props.widget.renderWidget(...)
 */

import React from 'react';
import type {WidgetTaskHandlerProps} from 'react-native-android-widget';
import {EXAM_SCHEDULE} from './data/examSchedule';
import {getNextExam, getCountdown} from './utils/countdownUtils';
import {ExamCountdownWidget} from './widgets/ExamCountdownWidget';

// ─── Handler ──────────────────────────────────────────────────────────────────

/**
 * The async function passed to `registerWidgetTaskHandler` in index.js.
 * React-native-android-widget calls this in a headless JS context.
 */
export async function widgetTaskHandler(
  props: WidgetTaskHandlerProps,
): Promise<void> {
  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      const nextExam = getNextExam(EXAM_SCHEDULE);

      if (!nextExam) {
        props.renderWidget(
          <ExamCountdownWidget
            courseCode=""
            venue=""
            timeString=""
            days={0}
            hours={0}
            minutes={0}
            allDone
          />,
        );
        return;
      }

      const {days, hours, minutes} = getCountdown(nextExam);

      props.renderWidget(
        <ExamCountdownWidget
          courseCode={nextExam.courseCode}
          venue={nextExam.venue}
          timeString={nextExam.timeString}
          days={days}
          hours={hours}
          minutes={minutes}
        />,
      );
      break;
    }

    case 'WIDGET_DELETED':
      // No cleanup needed for a stateless schedule widget.
      break;

    case 'WIDGET_CLICK':
      // A tap on the widget will open the main app (handled natively).
      break;

    default:
      // Re-render on any unknown future action.
      break;
  }
}
