package com.priyodigitallab.priyochauddagram

import android.app.Application
import com.google.firebase.FirebaseApp

class PriyoChauddagramApp : Application() {
    override fun onCreate() {
        super.onCreate()
        FirebaseApp.initializeApp(this)
    }
}
