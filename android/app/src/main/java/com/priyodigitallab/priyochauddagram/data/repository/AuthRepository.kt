package com.priyodigitallab.priyochauddagram.data.repository

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await

class AuthRepository(
    private val auth: FirebaseAuth = FirebaseAuth.getInstance(),
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
) {
    val currentUser: FirebaseUser?
        get() = auth.currentUser

    // Check if user has administrative privileges (Server / Firestore verified)
    suspend fun checkAdminPrivilege(email: String?): Boolean {
        if (email.isNullOrBlank()) return false
        val clean = email.lowercase().trim()
        if (clean == "matelecom.cb71@gmail.com" || clean == "fakrul@priyodigitallab.com") {
            return true
        }
        return try {
            val doc = firestore.collection("admin_users").document(clean).get().await()
            doc.exists()
        } catch (e: Exception) {
            false
        }
    }

    suspend fun signOut() {
        auth.signOut()
    }
}
