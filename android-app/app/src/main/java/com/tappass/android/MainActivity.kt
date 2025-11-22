package com.tappass.android

import android.app.PendingIntent
import android.content.Intent
import android.nfc.NdefMessage
import android.nfc.NdefRecord
import android.nfc.NfcAdapter
import android.nfc.Tag
import android.nfc.tech.Ndef
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.tappass.android.databinding.ActivityMainBinding
import kotlinx.coroutines.launch
import java.nio.charset.Charset

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private var nfcAdapter: NfcAdapter? = null
    private var pendingIntent: PendingIntent? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        nfcAdapter = NfcAdapter.getDefaultAdapter(this)
        
        if (nfcAdapter == null) {
            Toast.makeText(this, "NFC is not available on this device", Toast.LENGTH_LONG).show()
            finish()
            return
        }

        if (!nfcAdapter!!.isEnabled) {
            Toast.makeText(this, "Please enable NFC", Toast.LENGTH_LONG).show()
        }

        pendingIntent = PendingIntent.getActivity(
            this, 0,
            Intent(this, javaClass).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP),
            PendingIntent.FLAG_MUTABLE
        )

        binding.buttonRegister.setOnClickListener {
            // Handle manual registration if needed
            Toast.makeText(this, "Tap an NFC tag to register", Toast.LENGTH_SHORT).show()
        }

        handleIntent(intent)
    }

    override fun onResume() {
        super.onResume()
        nfcAdapter?.enableForegroundDispatch(this, pendingIntent, null, null)
    }

    override fun onPause() {
        super.onPause()
        nfcAdapter?.disableForegroundDispatch(this)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleIntent(intent)
    }

    private fun handleIntent(intent: Intent) {
        if (NfcAdapter.ACTION_NDEF_DISCOVERED == intent.action ||
            NfcAdapter.ACTION_TAG_DISCOVERED == intent.action
        ) {
            val tag: Tag? = intent.getParcelableExtra(NfcAdapter.EXTRA_TAG)
            tag?.let {
                readNfcTag(it)
            }
        }
    }

    private fun readNfcTag(tag: Tag) {
        val ndef = Ndef.get(tag)
        
        try {
            ndef?.connect()
            val ndefMessage = ndef?.ndefMessage
            
            if (ndefMessage != null) {
                val records = ndefMessage.records
                val tagData = records.joinToString("") { record ->
                    String(record.payload, Charset.forName("UTF-8"))
                }
                
                // Hash the tag data (simplified - in production use proper hashing)
                val tagHash = tagData.hashCode().toString()
                
                binding.textTagHash.text = "Tag Hash: $tagHash"
                binding.textStatus.text = "Tag detected!"
                
                // Register with backend
                registerTag(tagHash)
            } else {
                // If no NDEF data, use tag ID
                val tagId = tag.id.toHexString()
                binding.textTagHash.text = "Tag ID: $tagId"
                binding.textStatus.text = "Tag detected (no NDEF data)!"
                
                // Register with backend using tag ID
                registerTag(tagId)
            }
            
            ndef?.close()
        } catch (e: Exception) {
            binding.textStatus.text = "Error reading tag: ${e.message}"
            Toast.makeText(this, "Error reading NFC tag", Toast.LENGTH_SHORT).show()
        }
    }

    private fun registerTag(tagHash: String) {
        lifecycleScope.launch {
            try {
                binding.textStatus.text = "Registering tag..."
                
                // TODO: Replace with actual backend URL
                val backendUrl = "http://localhost:3000/register"
                val walletAddress = "0x0000000000000000000000000000000000000000" // TODO: Get from user
                
                val apiService = ApiService(backendUrl)
                val result = apiService.registerTag(tagHash, walletAddress)
                
                if (result.success) {
                    binding.textStatus.text = "Tag registered successfully!"
                    Toast.makeText(this@MainActivity, "Registration successful", Toast.LENGTH_SHORT).show()
                } else {
                    binding.textStatus.text = "Registration failed"
                    Toast.makeText(this@MainActivity, "Registration failed", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                binding.textStatus.text = "Error: ${e.message}"
                Toast.makeText(this@MainActivity, "Network error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun ByteArray.toHexString(): String {
        return joinToString("") { "%02x".format(it) }
    }
}

