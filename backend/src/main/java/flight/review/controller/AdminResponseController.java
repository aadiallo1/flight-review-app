package flight.review.controller;

import flight.review.entity.AdminResponse;
import flight.review.service.AdminResponseService;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/admin-responses")
@Validated
public class AdminResponseController {

    private final AdminResponseService adminResponseService;

    @Autowired
    public AdminResponseController(AdminResponseService adminResponseService) {
        this.adminResponseService = adminResponseService;
    }

    /**
     * Créer une réponse à un avis
     */
    @PostMapping
    public ResponseEntity<AdminResponse> createResponse(@Valid @RequestBody CreateResponseRequest request) {
        try {
            AdminResponse response = adminResponseService.createResponse(
                    request.getFlightReviewId(),
                    request.getResponseText(),
                    request.getAdminName()
            );
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

// Classe pour la requête de création de réponse
@Getter
@Setter
class CreateResponseRequest {
    private Long flightReviewId;
    private String responseText;
    private String adminName;
}


