package com.countdown

import android.app.Application
import com.countdown.widget.ExamCountdownWidgetWorker
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)

    // Schedule the periodic WorkManager job that refreshes the home-screen widget.
    // ExistingPeriodicWorkPolicy.KEEP means repeated calls are safe (no duplicates).
    ExamCountdownWidgetWorker.enqueue(this)
  }
}

