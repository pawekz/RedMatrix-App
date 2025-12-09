package com.redmatrix.notesapp.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.redmatrix.notesapp.entity.TransactionVerification;
import com.redmatrix.notesapp.service.TransactionVerificationService;
import com.redmatrix.notesapp.worker.TransactionVerificationWorker;

/**
 * REST Controller for transaction verification endpoints.
 * Provides APIs to:
 * - Queue transactions for verification
 * - Check verification status
 * - Get verification statistics
 * - Manually trigger verification retries
 */
@RestController
@RequestMapping("/api/verifications")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class TransactionVerificationController {

    private static final Logger logger = LoggerFactory.getLogger(TransactionVerificationController.class);

    @Autowired
    private TransactionVerificationService verificationService;

    @Autowired
    private TransactionVerificationWorker verificationWorker;

    /**
     * Queue a new transaction for verification.
     * POST /api/verifications
     * 
     * Request body:
     * {
     *   "noteId": 123,
     *   "txHash": "abc123...",
     *   "contentHash": "def456...",
     *   "ownerWallet": "addr_test1..."
     * }
     */
    @PostMapping
    public ResponseEntity<TransactionVerification> queueVerification(@RequestBody VerificationRequest request) {
        try {
            logger.info("Received verification request for noteId: {}, txHash: {}", 
                request.getNoteId(), request.getTxHash());

            if (request.getNoteId() == null || request.getTxHash() == null) {
                return ResponseEntity.badRequest().build();
            }

            TransactionVerification verification = verificationService.queueForVerification(
                request.getNoteId(),
                request.getTxHash(),
                request.getContentHash(),
                request.getOwnerWallet()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(verification);
        } catch (Exception e) {
            logger.error("Error queueing verification: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get verification by ID.
     * GET /api/verifications/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<TransactionVerification> getVerificationById(@PathVariable Long id) {
        Optional<TransactionVerification> verification = verificationService.getVerificationById(id);
        return verification.map(ResponseEntity::ok)
                          .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get verification by transaction hash.
     * GET /api/verifications/tx/{txHash}
     */
    @GetMapping("/tx/{txHash}")
    public ResponseEntity<TransactionVerification> getVerificationByTxHash(@PathVariable String txHash) {
        Optional<TransactionVerification> verification = verificationService.getVerificationByTxHash(txHash);
        return verification.map(ResponseEntity::ok)
                          .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all verifications for a note.
     * GET /api/verifications/note/{noteId}
     */
    @GetMapping("/note/{noteId}")
    public ResponseEntity<List<TransactionVerification>> getVerificationsForNote(@PathVariable Long noteId) {
        List<TransactionVerification> verifications = verificationService.getVerificationsForNote(noteId);
        return ResponseEntity.ok(verifications);
    }

    /**
     * Get the latest verification for a note.
     * GET /api/verifications/note/{noteId}/latest
     */
    @GetMapping("/note/{noteId}/latest")
    public ResponseEntity<TransactionVerification> getLatestVerificationForNote(@PathVariable Long noteId) {
        Optional<TransactionVerification> verification = verificationService.getLatestVerificationForNote(noteId);
        return verification.map(ResponseEntity::ok)
                          .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get verification statistics.
     * GET /api/verifications/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getVerificationStatistics() {
        Map<String, Long> stats = verificationService.getVerificationStatistics();
        return ResponseEntity.ok(stats);
    }

    /**
     * Get all verifications (admin endpoint).
     * GET /api/verifications
     */
    @GetMapping
    public ResponseEntity<List<TransactionVerification>> getAllVerifications() {
        List<TransactionVerification> verifications = verificationService.getAllVerifications();
        return ResponseEntity.ok(verifications);
    }

    /**
     * Get pending verifications.
     * GET /api/verifications/pending
     */
    @GetMapping("/pending")
    public ResponseEntity<List<TransactionVerification>> getPendingVerifications() {
        List<TransactionVerification> pending = verificationService.getPendingVerifications();
        return ResponseEntity.ok(pending);
    }

    /**
     * Manually retry a verification.
     * POST /api/verifications/{id}/retry
     */
    @PostMapping("/{id}/retry")
    public ResponseEntity<TransactionVerification> retryVerification(@PathVariable Long id) {
        try {
            logger.info("Manual retry requested for verification ID: {}", id);
            TransactionVerification verification = verificationService.retryVerification(id);
            return ResponseEntity.ok(verification);
        } catch (RuntimeException e) {
            logger.error("Error retrying verification {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error retrying verification {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get worker status.
     * GET /api/verifications/worker/status
     */
    @GetMapping("/worker/status")
    public ResponseEntity<WorkerStatus> getWorkerStatus() {
        WorkerStatus status = new WorkerStatus();
        status.setRunning(verificationWorker.isRunning());
        status.setBatchSize(verificationWorker.getBatchSize());
        return ResponseEntity.ok(status);
    }

    /**
     * Request DTO for queueing verifications.
     */
    public static class VerificationRequest {
        private Long noteId;
        private String txHash;
        private String contentHash;
        private String ownerWallet;

        public Long getNoteId() {
            return noteId;
        }

        public void setNoteId(Long noteId) {
            this.noteId = noteId;
        }

        public String getTxHash() {
            return txHash;
        }

        public void setTxHash(String txHash) {
            this.txHash = txHash;
        }

        public String getContentHash() {
            return contentHash;
        }

        public void setContentHash(String contentHash) {
            this.contentHash = contentHash;
        }

        public String getOwnerWallet() {
            return ownerWallet;
        }

        public void setOwnerWallet(String ownerWallet) {
            this.ownerWallet = ownerWallet;
        }
    }

    /**
     * Response DTO for worker status.
     */
    public static class WorkerStatus {
        private boolean running;
        private int batchSize;

        public boolean isRunning() {
            return running;
        }

        public void setRunning(boolean running) {
            this.running = running;
        }

        public int getBatchSize() {
            return batchSize;
        }

        public void setBatchSize(int batchSize) {
            this.batchSize = batchSize;
        }
    }
}
