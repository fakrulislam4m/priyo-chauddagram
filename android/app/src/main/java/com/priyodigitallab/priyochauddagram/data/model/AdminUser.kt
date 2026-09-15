package com.priyodigitallab.priyochauddagram.data.model

data class AdminUser(
    val email: String = "",
    val name: String = "",
    val role: String = "admin", // primary_admin, admin, moderator
    val phone: String = "",
    val created_at: String = "",
    val created_by: String = "Fakrul Islam"
)

data class SyncRun(
    val id: String = "",
    val status: String = "Success",
    val started_at: String = "",
    val completed_at: String? = null,
    val notices_fetched: Int = 0,
    val notices_added: Int = 0,
    val notices_updated: Int = 0,
    val triggered_by: String = "system"
)
