package flight.review.service;

import flight.review.entity.FlightReview;
import flight.review.entity.ReviewStatus;
import flight.review.repository.FlightReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class FlightReviewService {

    private final FlightReviewRepository flightReviewRepository;

    @Autowired
    public FlightReviewService(FlightReviewRepository flightReviewRepository) {
        this.flightReviewRepository = flightReviewRepository;
    }

    /**
     * Créer un nouvel avis
     */
    public FlightReview createReview(FlightReview review) {
        review.setStatus(ReviewStatus.PENDING);
        return flightReviewRepository.save(review);
    }

    /**
     * Récupérer tous les avis avec pagination et tri
     */
    public Page<FlightReview> getAllReviews(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return flightReviewRepository.findAll(pageable);
    }

    /**
     * Récupérer un avis par ID
     */
    public Optional<FlightReview> getReviewById(Long id) {
        return flightReviewRepository.findById(id);
    }

    /**
     * Récupérer les avis publiés (pour l'affichage public)
     */
    public List<FlightReview> getPublishedReviews() {
        return flightReviewRepository.findByStatusOrderByCreatedAtDesc(ReviewStatus.PUBLISHED);
    }

    /**
     * Récupérer les avis sans réponse
     */
    public List<FlightReview> getReviewsWithoutResponse() {
        return flightReviewRepository.findReviewsWithoutResponse();
    }

    /**
     * Recherche par mot-clé
     */
    public List<FlightReview> searchReviewsByKeyword(String keyword) {
        return flightReviewRepository.findByCommentContainingKeyword(keyword);
    }

    /**
     * Recherche multicritères avec pagination
     */
    public Page<FlightReview> searchReviews(String airline, String flightNumber,
                                            Integer rating, ReviewStatus status,
                                            LocalDate flightDate, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return flightReviewRepository.findByMultipleCriteria(
                airline, flightNumber, rating, status, flightDate, pageable);
    }

    /**
     * Mettre à jour le statut d'un avis
     */
    public FlightReview updateReviewStatus(Long id, ReviewStatus status) {
        Optional<FlightReview> reviewOpt = flightReviewRepository.findById(id);
        if (reviewOpt.isPresent()) {
            FlightReview review = reviewOpt.get();
            review.setStatus(status);
            return flightReviewRepository.save(review);
        }
        throw new RuntimeException("Avis non trouvé avec l'ID: " + id);
    }
}
