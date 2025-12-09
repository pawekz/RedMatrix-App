package com.redmatrix.notesapp.service;

import java.time.Instant;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.redmatrix.notesapp.entity.Note;
import com.redmatrix.notesapp.entity.TransactionVerification;
import com.redmatrix.notesapp.entity.TransactionVerification.VerificationStatus;
import com.redmatrix.notesapp.repository.NoteRepository;
import com.redmatrix.notesapp.repository.TransactionVerificationRepository;

/**
 * Service for managing transaction verification operations.
 * Handles creating verification records and verifying transactions against Blockfrost.
 */
@Service
public class TransactionVerificationService {

    private static final Logger logger = LoggerFactory.getLogger(TransactionVerificationService.class);

    @Autowired
    private TransactionVerificationRepository verificationRepository;

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private BlockfrostService blockfrostService;

    /**
     * Queue a new transaction for verification.
     * Called when a note is created/updated/deleted with blockchain proof.
     */
    @Transactional
    public TransactionVerification queueForVerification(Long noteId, String txHash, String contentHash, String ownerWallet) {
        logger.info("Queueing transaction for verification - noteId: {}, txHash: {}", noteId, txHash);

        // Check if verification already exists for this txHash
        if (verificationRepository.existsByTxHash(txHash)) {
            logger.warn("Verification already exists for txHash: {}", txHash);
            return verificationRepository.findByTxHash(txHash).orElse(null);
        }

        TransactionVerification verification = new TransactionVerification(noteId, txHash, contentHash, ownerWallet);
        TransactionVerification saved = verificationRepository.save(verification);
        
        logger.info("Created verification record with ID: {} for txHash: {}", saved.getId(), txHash);
        return saved;
    }

    /**
     * Verify a single transaction against Blockfrost.
     * Returns true if verification was successful, false otherwise.
     */
    @Transactional
    public boolean verifyTransaction(TransactionVerification verification) {
        logger.info("Starting verification for txHash: {}", verification.getTxHash());

        // Mark as processing
        verification.setStatus(VerificationStatus.PROCESSING);
        verificationRepository.save(verification);

        try {
            // Fetch metadata from Blockfrost
            List<Map<String, Object>> metadataList = blockfrostService.getTransactionMetadata(verification.getTxHash());

            if (metadataList == null || metadataList.isEmpty()) {
                handleVerificationFailure(verification, "No metadata found in transaction");
                return false;
            }

            // Parse the metadata (looking for label 674 which contains our note data)
            Map<String, Object> noteMetadata = extractNoteMetadata(metadataList);

            if (noteMetadata == null) {
                handleVerificationFailure(verification, "Note metadata (label 674) not found in transaction");
                return false;
            }

            // Extract fields from metadata
            String blockchainContentHash = extractStringFromMetadata(noteMetadata, "contentHash");
            String blockchainAction = extractStringFromMetadata(noteMetadata, "msg");
            String blockchainOwner = extractStringFromMetadata(noteMetadata, "owner");

            // Store blockchain data
            verification.setBlockchainContentHash(blockchainContentHash);
            verification.setBlockchainAction(blockchainAction);

            // Verify content hash matches
            boolean hashMatches = verification.getContentHash() != null && 
                                  verification.getContentHash().equals(blockchainContentHash);
            verification.setHashMatch(hashMatches);

            if (hashMatches) {
                // Verification successful
                verification.setStatus(VerificationStatus.VERIFIED);
                verification.setVerifiedAt(Instant.now().atOffset(ZoneOffset.UTC));
                verification.setLastError(null);
                verificationRepository.save(verification);

                // Update the note's verification status
                updateNoteVerificationStatus(verification.getNoteId(), true);

                logger.info("Transaction verified successfully - txHash: {}, hashMatch: true", verification.getTxHash());
                return true;
            } else {
                // Hash mismatch - this is a verification failure
                String error = String.format("Content hash mismatch. Expected: %s, Found: %s", 
                    verification.getContentHash(), blockchainContentHash);
                handleVerificationFailure(verification, error);
                return false;
            }

        } catch (Exception e) {
            logger.error("Error verifying transaction {}: {}", verification.getTxHash(), e.getMessage());
            handleVerificationFailure(verification, e.getMessage());
            return false;
        }
    }

    /**
     * Extract note metadata from Blockfrost response.
     * Looks for label "674" which is the standard for note metadata.
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> extractNoteMetadata(List<Map<String, Object>> metadataList) {
        for (Map<String, Object> metadata : metadataList) {
            Object label = metadata.get("label");
            if ("674".equals(String.valueOf(label))) {
                Object jsonMetadata = metadata.get("json_metadata");
                if (jsonMetadata instanceof Map) {
                    return (Map<String, Object>) jsonMetadata;
                }
            }
        }
        return null;
    }

    /**
     * Extract a string value from metadata, handling both direct strings and arrays.
     */
    @SuppressWarnings("unchecked")
    private String extractStringFromMetadata(Map<String, Object> metadata, String key) {
        Object value = metadata.get(key);
        if (value == null) {
            return null;
        }
        if (value instanceof String) {
            return (String) value;
        }
        if (value instanceof List) {
            List<Object> list = (List<Object>) value;
            if (!list.isEmpty()) {
                return String.valueOf(list.get(0));
            }
        }
        return String.valueOf(value);
    }

    /**
     * Handle verification failure - increment retry count and update status.
     */
    private void handleVerificationFailure(TransactionVerification verification, String error) {
        verification.incrementRetryCount();
        verification.setLastError(error);

        if (verification.hasExceededMaxRetries()) {
            verification.setStatus(VerificationStatus.EXPIRED);
            logger.warn("Verification expired for txHash: {} after {} retries", 
                verification.getTxHash(), verification.getRetryCount());
        } else {
            verification.setStatus(VerificationStatus.FAILED);
            logger.warn("Verification failed for txHash: {} (retry {}/{}): {}", 
                verification.getTxHash(), verification.getRetryCount(), 
                verification.getMaxRetries(), error);
        }

        verificationRepository.save(verification);
        updateNoteVerificationStatus(verification.getNoteId(), false);
    }

    /**
     * Update the note's verification status in the database.
     */
    private void updateNoteVerificationStatus(Long noteId, boolean verified) {
        Optional<Note> noteOpt = noteRepository.findById(noteId);
        if (noteOpt.isPresent()) {
            Note note = noteOpt.get();
            note.setVerificationStatus(verified ? "VERIFIED" : "UNVERIFIED");
            noteRepository.save(note);
            logger.info("Note {} verification status updated to: {}", noteId, verified ? "VERIFIED" : "UNVERIFIED");
        }
    }

    /**
     * Get all pending verifications that need processing.
     */
    public List<TransactionVerification> getPendingVerifications() {
        return verificationRepository.findVerificationsNeedingRetry();
    }

    /**
     * Get verification by ID.
     */
    public Optional<TransactionVerification> getVerificationById(Long id) {
        return verificationRepository.findById(id);
    }

    /**
     * Get verification by transaction hash.
     */
    public Optional<TransactionVerification> getVerificationByTxHash(String txHash) {
        return verificationRepository.findByTxHash(txHash);
    }

    /**
     * Get all verifications for a note.
     */
    public List<TransactionVerification> getVerificationsForNote(Long noteId) {
        return verificationRepository.findByNoteIdOrderByCreatedAtDesc(noteId);
    }

    /**
     * Get the latest verification for a note.
     */
    public Optional<TransactionVerification> getLatestVerificationForNote(Long noteId) {
        return verificationRepository.findFirstByNoteIdOrderByCreatedAtDesc(noteId);
    }

    /**
     * Get verification statistics.
     */
    public Map<String, Long> getVerificationStatistics() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("pending", verificationRepository.countByStatus(VerificationStatus.PENDING));
        stats.put("processing", verificationRepository.countByStatus(VerificationStatus.PROCESSING));
        stats.put("verified", verificationRepository.countByStatus(VerificationStatus.VERIFIED));
        stats.put("failed", verificationRepository.countByStatus(VerificationStatus.FAILED));
        stats.put("expired", verificationRepository.countByStatus(VerificationStatus.EXPIRED));
        stats.put("total", verificationRepository.count());
        return stats;
    }

    /**
     * Get all verifications (for admin/debugging).
     */
    public List<TransactionVerification> getAllVerifications() {
        return verificationRepository.findAll();
    }

    /**
     * Mark expired verifications.
     */
    @Transactional
    public int markExpiredVerifications() {
        List<TransactionVerification> expired = verificationRepository.findExpiredVerifications();
        int count = 0;
        for (TransactionVerification v : expired) {
            v.setStatus(VerificationStatus.EXPIRED);
            verificationRepository.save(v);
            count++;
        }
        if (count > 0) {
            logger.info("Marked {} verifications as expired", count);
        }
        return count;
    }

    /**
     * Manually trigger verification for a specific transaction.
     */
    @Transactional
    public TransactionVerification retryVerification(Long verificationId) {
        Optional<TransactionVerification> opt = verificationRepository.findById(verificationId);
        if (opt.isEmpty()) {
            throw new RuntimeException("Verification not found with id: " + verificationId);
        }

        TransactionVerification verification = opt.get();
        
        // Reset status to pending for retry
        verification.setStatus(VerificationStatus.PENDING);
        verificationRepository.save(verification);
        
        // Attempt verification
        verifyTransaction(verification);
        
        return verificationRepository.findById(verificationId).orElse(verification);
    }
}
