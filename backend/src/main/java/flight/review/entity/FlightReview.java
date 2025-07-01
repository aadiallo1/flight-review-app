package flight.review.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "flight_reviews")
public class FlightReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le numéro de vol est obligatoire")
    @Column(name = "flight_number", nullable = false)
    private String flightNumber;

    @NotBlank(message = "La compagnie est obligatoire")
    @Column(name = "airline", nullable = false)
    private String airline;

    @NotNull(message = "La date de vol est obligatoire")
    @Column(name = "flight_date", nullable = false)
    private LocalDate flightDate;

    @NotNull(message = "La note est obligatoire")
    @Min(value = 1, message = "La note doit être comprise entre 1 et 5")
    @Max(value = 5, message = "La note doit être comprise entre 1 et 5")
    @Column(name = "rating", nullable = false)
    private Integer rating;

    @NotBlank(message = "Le commentaire est obligatoire")
    @Size(min = 10, max = 1000, message = "Le commentaire doit contenir entre 10 et 1000 caractères")
    @Column(name = "comment", nullable = false, length = 1000)
    private String comment;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ReviewStatus status = ReviewStatus.PENDING;

    // Relation OneToOne avec la réponse admin (optionnelle)
    @OneToOne(mappedBy = "flightReview", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private AdminResponse adminResponse;

    // Constructeurs
    public FlightReview() {
        this.createdAt = LocalDateTime.now();
    }

    public FlightReview(String flightNumber, String airline, LocalDate flightDate,
                        Integer rating, String comment) {
        this();
        this.flightNumber = flightNumber;
        this.airline = airline;
        this.flightDate = flightDate;
        this.rating = rating;
        this.comment = comment;
    }
}

