/**
 * widgetTaskHandler.tsx
 * ─────────────────────────────────────────────
 * Headless JS task handler for react-native-android-widget.
 * Reads exams from AsyncStorage (user-managed data).
 */

import React from 'react';
import type {WidgetTaskHandlerProps} from 'react-native-android-widget';
import {getExams} from './data/examStorage';
import {getNextExam, getCountdown} from './utils/countdownUtils';
import {ExamCountdownWidget} from './widgets/ExamCountdownWidget';

export async function widgetTaskHandler(
  props: WidgetTaskHandlerProps,
): Promise<void> {
  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      const exams = await getExams();
      const nextExam = getNextExam(exams);

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
      break;

    case 'WIDGET_CLICK':
      break;

    default:
      break;
  }
}
