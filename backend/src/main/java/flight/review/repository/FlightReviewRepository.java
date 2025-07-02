package flight.review.repository;


import flight.review.entity.FlightReview;
import flight.review.entity.ReviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FlightReviewRepository extends JpaRepository<FlightReview, Long> {

    // Trouver les avis sans réponse admin
    @Query("SELECT fr FROM FlightReview fr WHERE fr.adminResponse IS NULL")
    List<FlightReview> findReviewsWithoutResponse();

    // Recherche par mot-clé dans le commentaire
    @Query("SELECT fr FROM FlightReview fr WHERE LOWER(fr.comment) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<FlightReview> findByCommentContainingKeyword(@Param("keyword") String keyword);

    // Trouver les avis publiés (pour l'affichage public)
    List<FlightReview> findByStatusOrderByCreatedAtDesc(ReviewStatus status);

    // Recherche complexe avec plusieurs critères
    @Query("SELECT fr FROM FlightReview fr WHERE " +
            "(:airline IS NULL OR LOWER(fr.airline) LIKE LOWER(CONCAT('%', :airline, '%'))) AND " +
            "(:flightNumber IS NULL OR LOWER(fr.flightNumber) LIKE LOWER(CONCAT('%', :flightNumber, '%'))) AND " +
            "(:rating IS NULL OR fr.rating = :rating) AND " +
            "(:status IS NULL OR fr.status = :status) AND " +
            "(:flightDate IS NULL OR fr.flightDate = :flightDate)")
    Page<FlightReview> findByMultipleCriteria(
            @Param("airline") String airline,
            @Param("flightNumber") String flightNumber,
            @Param("rating") Integer rating,
            @Param("status") ReviewStatus status,
            @Param("flightDate") LocalDate flightDate,
            Pageable pageable
    );
}
