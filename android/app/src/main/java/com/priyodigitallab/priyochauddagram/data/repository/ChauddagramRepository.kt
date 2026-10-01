package com.priyodigitallab.priyochauddagram.data.repository

import com.google.firebase.firestore.FirebaseFirestore
import com.priyodigitallab.priyochauddagram.data.model.*
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class ChauddagramRepository(
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
) {
    private val adminSignature = "fakrul_islam_priyo_chauddagram_auth"

    // Upazila Profile Flow
    fun getUpazilaProfileFlow(): Flow<UpazilaProfile?> = callbackFlow {
        val docRef = firestore.collection("upazila_profile").document("chauddagram_profile")
        val listener = docRef.addSnapshotListener { snapshot, error ->
            if (error != null) {
                close(error)
                return@addSnapshotListener
            }
            if (snapshot != null && snapshot.exists()) {
                val profile = snapshot.toObject(UpazilaProfile::class.java)
                trySend(profile)
            } else {
                trySend(null)
            }
        }
        awaitClose { listener.remove() }
    }

    // Save Upazila Profile (Admin)
    suspend fun saveUpazilaProfile(profile: UpazilaProfile, adminEmail: String) {
        val payload = hashMapOf<String, Any>(
            "id" to profile.id,
            "name_bn" to profile.name_bn,
            "name_en" to profile.name_en,
            "district_bn" to profile.district_bn,
            "district_en" to profile.district_en,
            "tagline_bn" to profile.tagline_bn,
            "tagline_en" to profile.tagline_en,
            "description_bn" to profile.description_bn,
            "description_en" to profile.description_en,
            "history_bn" to profile.history_bn,
            "history_en" to profile.history_en,
            "geography_bn" to profile.geography_bn,
            "geography_en" to profile.geography_en,
            "administration_bn" to profile.administration_bn,
            "administration_en" to profile.administration_en,
            "municipality_count" to profile.municipality_count,
            "union_count" to profile.union_count,
            "official_website_url" to profile.official_website_url,
            "publication_status" to profile.publication_status,
            "updated_at" to java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US).format(java.util.Date()),
            "updated_by" to "Fakrul Islam",
            "admin_signature" to adminSignature
        )
        firestore.collection("upazila_profile").document("chauddagram_profile")
            .set(payload, com.google.firebase.firestore.SetOptions.merge())
            .await()
    }

    // Unions Flow (Sorted by order, clean display names)
    fun getUnionsFlow(): Flow<List<UnionItem>> = callbackFlow {
        val colRef = firestore.collection("unions").orderBy("order")
        val listener = colRef.addSnapshotListener { snapshot, error ->
            if (error != null) {
                close(error)
                return@addSnapshotListener
            }
            val list = snapshot?.toObjects(UnionItem::class.java) ?: emptyList()
            trySend(list)
        }
        awaitClose { listener.remove() }
    }

    // Save Union (Admin)
    suspend fun saveUnion(union: UnionItem) {
        val payload = hashMapOf<String, Any>(
            "id" to union.id,
            "name_bn" to union.name_bn,
            "name_en" to union.name_en,
            "order" to union.order,
            "status" to union.status,
            "updated_at" to java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US).format(java.util.Date()),
            "admin_signature" to adminSignature
        )
        firestore.collection("unions").document(union.id)
            .set(payload, com.google.firebase.firestore.SetOptions.merge())
            .await()
    }

    // Government Notices Flow
    fun getGovernmentNoticesFlow(): Flow<List<GovernmentNotice>> = callbackFlow {
        val colRef = firestore.collection("government_notices")
        val listener = colRef.addSnapshotListener { snapshot, error ->
            if (error != null) {
                close(error)
                return@addSnapshotListener
            }
            val list = snapshot?.toObjects(GovernmentNotice::class.java) ?: emptyList()
            trySend(list.sortedByDescending { it.created_at })
        }
        awaitClose { listener.remove() }
    }

    // Update Notice Status
    suspend fun updateNoticeStatus(noticeId: String, status: String) {
        firestore.collection("government_notices").document(noticeId)
            .update(mapOf("status" to status, "admin_signature" to adminSignature))
            .await()
    }

    // Sponsored Campaigns Flow
    fun getSponsoredCampaignsFlow(): Flow<List<SponsoredCampaign>> = callbackFlow {
        val colRef = firestore.collection("sponsored_campaigns").orderBy("display_order")
        val listener = colRef.addSnapshotListener { snapshot, error ->
            if (error != null) {
                close(error)
                return@addSnapshotListener
            }
            val list = snapshot?.toObjects(SponsoredCampaign::class.java) ?: emptyList()
            trySend(list)
        }
        awaitClose { listener.remove() }
    }

    // Save Sponsored Campaign
    suspend fun saveSponsoredCampaign(campaign: SponsoredCampaign) {
        val payload = hashMapOf<String, Any>(
            "id" to campaign.id,
            "advertiser_type" to campaign.advertiser_type,
            "advertiser_name" to campaign.advertiser_name,
            "title_bn" to campaign.title_bn,
            "title_en" to campaign.title_en,
            "phone" to campaign.phone,
            "address_bn" to campaign.address_bn,
            "address_en" to campaign.address_en,
            "payment_status" to campaign.payment_status,
            "approval_status" to campaign.approval_status,
            "publication_status" to campaign.publication_status,
            "campaign_start_date" to campaign.campaign_start_date,
            "campaign_end_date" to campaign.campaign_end_date,
            "display_order" to campaign.display_order,
            "updated_at" to java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US).format(java.util.Date()),
            "updated_by" to "Fakrul Islam",
            "admin_signature" to adminSignature
        )
        campaign.specialty_bn?.let { payload["specialty_bn"] = it }
        campaign.chamber_days?.let { payload["chamber_days"] = it }
        campaign.payment_reference?.let { payload["payment_reference"] = it }

        firestore.collection("sponsored_campaigns").document(campaign.id)
            .set(payload, com.google.firebase.firestore.SetOptions.merge())
            .await()
    }

    // Sync Runs Flow
    fun getSyncRunsFlow(): Flow<List<SyncRun>> = callbackFlow {
        val colRef = firestore.collection("sync_runs")
        val listener = colRef.addSnapshotListener { snapshot, error ->
            if (error != null) {
                close(error)
                return@addSnapshotListener
            }
            val list = snapshot?.toObjects(SyncRun::class.java) ?: emptyList()
            trySend(list.sortedByDescending { it.started_at })
        }
        awaitClose { listener.remove() }
    }

    // Admin Users Flow
    fun getAdminUsersFlow(): Flow<List<AdminUser>> = callbackFlow {
        val colRef = firestore.collection("admin_users")
        val listener = colRef.addSnapshotListener { snapshot, error ->
            if (error != null) {
                close(error)
                return@addSnapshotListener
            }
            val list = snapshot?.toObjects(AdminUser::class.java) ?: emptyList()
            trySend(list)
        }
        awaitClose { listener.remove() }
    }
}
