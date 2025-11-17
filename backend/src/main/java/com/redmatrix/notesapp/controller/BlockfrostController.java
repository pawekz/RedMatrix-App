package com.redmatrix.notesapp.controller;

import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.redmatrix.notesapp.service.BlockfrostService;

@RestController
@RequestMapping("/api/blockfrost")
@CrossOrigin(origins = "http://localhost:5173")
public class BlockfrostController {
    
    private static final Logger logger = LoggerFactory.getLogger(BlockfrostController.class);
    
    @Autowired
    private BlockfrostService blockfrostService;
    
    /**
     * GET /api/blockfrost/txs/{txHash}/metadata
     * Fetch transaction metadata from Blockfrost API
     */
    @GetMapping("/txs/{txHash}/metadata")
    public ResponseEntity<List<Map<String, Object>>> getTransactionMetadata(@PathVariable String txHash) {
        try {
            logger.info("Received request for transaction metadata: {}", txHash);
            List<Map<String, Object>> metadata = blockfrostService.getTransactionMetadata(txHash);
            return ResponseEntity.ok(metadata);
        } catch (IllegalStateException e) {
            logger.error("Blockfrost configuration error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(null);
        } catch (RuntimeException e) {
            logger.error("Error fetching transaction metadata: {}", e.getMessage());
            // Check if it's a 404 error
            if (e.getMessage().contains("Transaction not found") || e.getMessage().contains("404")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}

