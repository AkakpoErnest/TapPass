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

        // Load available chains on startup
        loadAvailableChains()

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
                
                // TODO: Replace with actual backend URL (use 10.0.2.2 for emulator)
                val backendUrl = "http://10.0.2.2:3000"
                val walletAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0" // TODO: Get from user/wallet
                
                val apiService = ApiService(backendUrl)
                
                // Try cross-chain registration first (register to multiple chains)
                val chains = listOf("sepolia", "arbitrumSepolia") // Default chains
                val result = apiService.registerTagCrossChain(tagHash, walletAddress, chains)
                
                if (result.success) {
                    val chainsList = result.data?.optJSONArray("chains")?.let { array ->
                        (0 until array.length()).map { array.getString(it) }
                    } ?: emptyList()
                    
                    binding.textStatus.text = "Tag registered cross-chain!\nChains: ${chainsList.joinToString(", ")}"
                    Toast.makeText(this@MainActivity, "Cross-chain registration successful!", Toast.LENGTH_LONG).show()
                } else {
                    // Fallback to single-chain registration
                    val fallbackResult = apiService.registerTag(tagHash, walletAddress)
                    if (fallbackResult.success) {
                        binding.textStatus.text = "Tag registered successfully!"
                        Toast.makeText(this@MainActivity, "Registration successful", Toast.LENGTH_SHORT).show()
                    } else {
                        binding.textStatus.text = "Registration failed: ${fallbackResult.message}"
                        Toast.makeText(this@MainActivity, "Registration failed", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                binding.textStatus.text = "Error: ${e.message}"
                Toast.makeText(this@MainActivity, "Network error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun loadAvailableChains() {
        lifecycleScope.launch {
            try {
                val backendUrl = "http://10.0.2.2:3000"
                val apiService = ApiService(backendUrl)
                val result = apiService.getAvailableChains()
                
                if (result.success) {
                    val chainsData = result.data?.optJSONArray("chains")
                    val chainsList = chainsData?.let { array ->
                        (0 until array.length()).map { 
                            array.getJSONObject(it).optString("name")
                        }
                    } ?: emptyList()
                    
                    Log.d("MainActivity", "Available chains: ${chainsList.joinToString()}")
                }
            } catch (e: Exception) {
                Log.e("MainActivity", "Error loading chains", e)
            }
        }
    }

    private fun ByteArray.toHexString(): String {
        return joinToString("") { "%02x".format(it) }
    }
}

