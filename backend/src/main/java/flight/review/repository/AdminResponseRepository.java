package flight.review.repository;

import flight.review.entity.AdminResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminResponseRepository extends JpaRepository<AdminResponse, Long> {

    // Vérifier si un avis a déjà une réponse
    boolean existsByFlightReviewId(Long flightReviewId);
}
