package com.countdown.widget

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import androidx.work.*
import java.util.concurrent.TimeUnit

/**
 * ExamCountdownWidgetWorker.kt
 * ─────────────────────────────────────────────
 * A WorkManager CoroutineWorker that periodically wakes up the
 * react-native-android-widget AppWidget receiver so it triggers the
 * JS widgetTaskHandler (WIDGET_UPDATE action).
 *
 * Android enforces a minimum PeriodicWorkRequest interval of 15 minutes.
 *
 * Usage: call  ExamCountdownWidgetWorker.enqueue(context)  once at app
 * startup (MainApplication.onCreate) and again after device boot
 * (WidgetBootReceiver).
 */
class ExamCountdownWidgetWorker(
    private val context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result {
        // Broadcast an APPWIDGET_UPDATE intent so the RNAndroidWidgetProvider
        // (and thus the JS task handler) is called with WIDGET_UPDATE.
        val manager = AppWidgetManager.getInstance(context)
        val provider = ComponentName(
            context,
            "com.reactnativeandroidwidget.RNWidgetProvider"
        )
        val ids = manager.getAppWidgetIds(provider)

        if (ids.isNotEmpty()) {
            val updateIntent = Intent(AppWidgetManager.ACTION_APPWIDGET_UPDATE).apply {
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
                component = provider
            }
            context.sendBroadcast(updateIntent)
        }

        return Result.success()
    }

    companion object {
        private const val WORK_NAME = "ExamCountdownWidgetWorker"

        /**
         * Enqueue a unique periodic job (15-minute interval).
         * Uses KEEP policy so an existing schedule is never replaced on
         * repeated calls (e.g. multiple app opens).
         */
        fun enqueue(context: Context) {
            val request = PeriodicWorkRequestBuilder<ExamCountdownWidgetWorker>(
                repeatInterval = 15,
                repeatIntervalTimeUnit = TimeUnit.MINUTES
            )
                .setConstraints(
                    Constraints.Builder()
                        .setRequiresBatteryNotLow(false)
                        .build()
                )
                .build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                WORK_NAME,
                ExistingPeriodicWorkPolicy.KEEP,
                request
            )
        }
    }
}
