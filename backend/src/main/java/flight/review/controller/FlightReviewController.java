package flight.review.controller;

import flight.review.entity.FlightReview;
import flight.review.entity.ReviewStatus;
import flight.review.service.FlightReviewService;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reviews")
@Validated
public class FlightReviewController {

    private final FlightReviewService flightReviewService;

    @Autowired
    public FlightReviewController(FlightReviewService flightReviewService) {
        this.flightReviewService = flightReviewService;
    }

    /**
     * Créer un nouvel avis (partie client)
     */
    @PostMapping
    public ResponseEntity<FlightReview> createReview(@Valid @RequestBody FlightReview review) {
        try {
            FlightReview savedReview = flightReviewService.createReview(review);
            return new ResponseEntity<>(savedReview, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Récupérer tous les avis avec pagination (back-office)
     */
    @GetMapping
    public ResponseEntity<Page<FlightReview>> getAllReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        try {
            Page<FlightReview> reviews = flightReviewService.getAllReviews(page, size, sortBy, sortDir);
            return new ResponseEntity<>(reviews, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Récupérer un avis par ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<FlightReview> getReviewById(@PathVariable Long id) {
        Optional<FlightReview> review = flightReviewService.getReviewById(id);
        return review.map(r -> new ResponseEntity<>(r, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * Récupérer les avis publiés (partie publique)
     */
    @GetMapping("/public")
    public ResponseEntity<List<FlightReview>> getPublishedReviews() {
        try {
            List<FlightReview> reviews = flightReviewService.getPublishedReviews();
            return new ResponseEntity<>(reviews, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Récupérer les avis sans réponse
     */
    @GetMapping("/no-response")
    public ResponseEntity<List<FlightReview>> getReviewsWithoutResponse() {
        try {
            List<FlightReview> reviews = flightReviewService.getReviewsWithoutResponse();
            return new ResponseEntity<>(reviews, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Recherche multicritères
     */
    @GetMapping("/search")
    public ResponseEntity<Page<FlightReview>> searchReviews(
            @RequestParam(required = false) String airline,
            @RequestParam(required = false) String flightNumber,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) ReviewStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate flightDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<FlightReview> reviews = flightReviewService.searchReviews(
                    airline, flightNumber, rating, status, flightDate, page, size);
            return new ResponseEntity<>(reviews, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Recherche par mot-clé
     */
    @GetMapping("/search-keyword")
    public ResponseEntity<List<FlightReview>> searchByKeyword(@RequestParam String keyword) {
        try {
            List<FlightReview> reviews = flightReviewService.searchReviewsByKeyword(keyword);
            return new ResponseEntity<>(reviews, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Mettre à jour le statut d'un avis
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<FlightReview> updateReviewStatus(
            @PathVariable Long id,
            @RequestBody ReviewStatusRequest request) {
        try {
            FlightReview updatedReview = flightReviewService.updateReviewStatus(id, request.getStatus());
            return new ResponseEntity<>(updatedReview, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

// Classe pour la requête de mise à jour du statut
@Getter
@Setter
class ReviewStatusRequest {
    private ReviewStatus status;

}
