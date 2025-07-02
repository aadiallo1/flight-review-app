package flight.review.service;

import flight.review.entity.AdminResponse;
import flight.review.entity.FlightReview;
import flight.review.entity.ReviewStatus;
import flight.review.repository.AdminResponseRepository;
import flight.review.repository.FlightReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class AdminResponseService {

    private final AdminResponseRepository adminResponseRepository;
    private final FlightReviewRepository flightReviewRepository;

    @Autowired
    public AdminResponseService(AdminResponseRepository adminResponseRepository,
                                FlightReviewRepository flightReviewRepository) {
        this.adminResponseRepository = adminResponseRepository;
        this.flightReviewRepository = flightReviewRepository;
    }

    /**
     * Créer une réponse à un avis
     */
    public AdminResponse createResponse(Long flightReviewId, String responseText, String adminName) {
        // Vérifier si l'avis existe
        Optional<FlightReview> flightReviewOpt = flightReviewRepository.findById(flightReviewId);
        if (!flightReviewOpt.isPresent()) {
            throw new RuntimeException("Avis non trouvé avec l'ID: " + flightReviewId);
        }

        FlightReview flightReview = flightReviewOpt.get();

        // Vérifier si une réponse existe déjà
        if (adminResponseRepository.existsByFlightReviewId(flightReviewId)) {
            throw new RuntimeException("Une réponse existe déjà pour cet avis");
        }

        // Créer la réponse
        AdminResponse response = new AdminResponse(responseText, adminName, flightReview);
        AdminResponse savedResponse = adminResponseRepository.save(response);

        // Mettre à jour le statut de l'avis
        flightReview.setStatus(ReviewStatus.RESPONDED);
        flightReviewRepository.save(flightReview);

        return savedResponse;
    }
}
