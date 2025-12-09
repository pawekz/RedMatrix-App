package com.redmatrix.notesapp.worker;

import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.redmatrix.notesapp.entity.TransactionVerification;
import com.redmatrix.notesapp.service.TransactionVerificationService;

/**
 * Background worker that periodically verifies pending blockchain transactions.
 * 
 * This worker runs on a scheduled interval and processes transactions that:
 * - Are in PENDING or FAILED status
 * - Have not exceeded their maximum retry count
 * 
 * The worker ensures only one instance runs at a time to prevent duplicate processing.
 */
@Component
public class TransactionVerificationWorker {

    private static final Logger logger = LoggerFactory.getLogger(TransactionVerificationWorker.class);

    @Autowired
    private TransactionVerificationService verificationService;

    /**
     * Maximum number of verifications to process per run.
     * This prevents the worker from running too long in a single cycle.
     */
    @Value("${verification.worker.batch-size:10}")
    private int batchSize;

    /**
     * Flag to prevent concurrent execution of the worker.
     */
    private final AtomicBoolean isRunning = new AtomicBoolean(false);

    /**
     * Main scheduled task that processes pending verifications.
     * Runs every 30 seconds by default.
     * 
     * The cron expression "0/30 * * * * ?" means:
     * - 0/30: Every 30 seconds starting at second 0
     * - *: Every minute
     * - *: Every hour
     * - *: Every day of month
     * - *: Every month
     * - ?: No specific day of week
     */
    @Scheduled(cron = "${verification.worker.cron:0/30 * * * * ?}")
    public void processVerifications() {
        // Prevent concurrent execution
        if (!isRunning.compareAndSet(false, true)) {
            logger.debug("Verification worker already running, skipping this cycle");
            return;
        }

        try {
            logger.debug("Starting verification worker cycle");
            
            // Get pending verifications
            List<TransactionVerification> pending = verificationService.getPendingVerifications();
            
            if (pending.isEmpty()) {
                logger.debug("No pending verifications to process");
                return;
            }

            logger.info("Found {} pending verifications, processing up to {}", pending.size(), batchSize);

            int processed = 0;
            int verified = 0;
            int failed = 0;

            // Process up to batchSize verifications
            for (TransactionVerification verification : pending) {
                if (processed >= batchSize) {
                    logger.info("Batch size limit reached, remaining verifications will be processed in next cycle");
                    break;
                }

                try {
                    boolean success = verificationService.verifyTransaction(verification);
                    if (success) {
                        verified++;
                    } else {
                        failed++;
                    }
                } catch (Exception e) {
                    logger.error("Error processing verification {}: {}", verification.getId(), e.getMessage());
                    failed++;
                }

                processed++;

                // Small delay between verifications to avoid rate limiting
                try {
                    Thread.sleep(500);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    logger.warn("Verification worker interrupted");
                    break;
                }
            }

            logger.info("Verification worker cycle completed - processed: {}, verified: {}, failed: {}", 
                processed, verified, failed);

        } catch (Exception e) {
            logger.error("Error in verification worker: {}", e.getMessage(), e);
        } finally {
            isRunning.set(false);
        }
    }

    /**
     * Scheduled task to mark expired verifications.
     * Runs every 5 minutes.
     */
    @Scheduled(cron = "${verification.worker.expire-cron:0 0/5 * * * ?}")
    public void markExpiredVerifications() {
        try {
            int expired = verificationService.markExpiredVerifications();
            if (expired > 0) {
                logger.info("Marked {} verifications as expired", expired);
            }
        } catch (Exception e) {
            logger.error("Error marking expired verifications: {}", e.getMessage());
        }
    }

    /**
     * Check if the worker is currently running.
     */
    public boolean isRunning() {
        return isRunning.get();
    }

    /**
     * Get the configured batch size.
     */
    public int getBatchSize() {
        return batchSize;
    }
}
