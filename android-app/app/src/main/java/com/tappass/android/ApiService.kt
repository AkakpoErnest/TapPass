package com.tappass.android

import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class ApiService(private val baseUrl: String) {
    private val client = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .build()

    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    suspend fun registerTag(tagHash: String, walletAddress: String): ApiResponse {
        return withContext(Dispatchers.IO) {
            try {
                val json = JSONObject().apply {
                    put("tagHash", tagHash)
                    put("wallet", walletAddress)
                }

                val requestBody = json.toString().toRequestBody(jsonMediaType)
                val request = Request.Builder()
                    .url("$baseUrl/register")
                    .post(requestBody)
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string() ?: ""

                Log.d("ApiService", "Response: $responseBody")

                if (response.isSuccessful) {
                    val jsonResponse = JSONObject(responseBody)
                    ApiResponse(
                        success = jsonResponse.optBoolean("success", false),
                        message = jsonResponse.optString("message", ""),
                        data = jsonResponse.optJSONObject("data")
                    )
                } else {
                    ApiResponse(
                        success = false,
                        message = "Server error: ${response.code}",
                        data = null
                    )
                }
            } catch (e: Exception) {
                Log.e("ApiService", "Error registering tag", e)
                ApiResponse(
                    success = false,
                    message = e.message ?: "Unknown error",
                    data = null
                )
            }
        }
    }
}

data class ApiResponse(
    val success: Boolean,
    val message: String,
    val data: JSONObject?
)

