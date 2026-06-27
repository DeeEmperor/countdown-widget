package com.countdown.widget

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/**
 * WidgetBootReceiver.kt
 * ─────────────────────────────────────────────
 * Receives BOOT_COMPLETED broadcasts so we can re-enqueue the
 * WorkManager periodic job after a device reboot.
 *
 * Registered in AndroidManifest.xml with RECEIVE_BOOT_COMPLETED permission.
 */
class WidgetBootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            ExamCountdownWidgetWorker.enqueue(context)
        }
    }
}
