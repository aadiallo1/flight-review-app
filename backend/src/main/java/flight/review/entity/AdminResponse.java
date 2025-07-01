package flight.review.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "admin_responses")
public class AdminResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "La réponse ne peut pas être vide")
    @Size(min = 10, max = 1000, message = "La réponse doit contenir entre 10 et 1000 caractères")
    @Column(name = "response_text", nullable = false, length = 1000)
    private String responseText;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "admin_name")
    private String adminName;

    // Relation OneToOne avec FlightReview
    @OneToOne
    @JoinColumn(name = "flight_review_id", nullable = false)
    @JsonIgnore
    private FlightReview flightReview;

    // Constructeurs
    public AdminResponse() {
        this.createdAt = LocalDateTime.now();
    }

    public AdminResponse(String responseText, String adminName, FlightReview flightReview) {
        this();
        this.responseText = responseText;
        this.adminName = adminName;
        this.flightReview = flightReview;
    }
}
