# Application Avis de Vols ( Angular & Springboot )

## Description du projet

Application web complète de gestion d'avis de vols permettant aux utilisateurs de soumettre des avis sur leurs expériences de vol et aux administrateurs de modérer et répondre à ces avis.

### Fonctionnalités principales
- **Interfaces** : Consultation et soumission d'avis de vols
- **Back-office administrateur** : Modération, réponse et gestion des avis
- **Système de notation** : Évaluation par étoiles (1-5)
- **Recherche avancée** : Filtrage multicritères des avis

## Architecture globale

L'application suit une architecture moderne avec séparation frontend/backend :

```
┌─────────────────────────────────────┐
│           FRONTEND ANGULAR          │
│  ┌─────────────────────────────────┐ │
│  │        Components               │ │
│  ├─────────────────────────────────┤ │
│  │        Services                 │ │
│  ├─────────────────────────────────┤ │
│  │        HTTP Client              │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
                    │
                HTTP/REST API
                    │
┌─────────────────────────────────────┐
│        BACKEND SPRING BOOT          │
│  ┌─────────────────────────────────┐ │
│  │        Controllers              │ │
│  ├─────────────────────────────────┤ │
│  │        Services                 │ │
│  ├─────────────────────────────────┤ │
│  │        Repositories             │ │
│  ├─────────────────────────────────┤ │
│  │        Entities (JPA)           │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
                    │
              Base de données H2
```

## Démarrage rapide

### Prérequis
- **Java** : 17+
- **Node.js** : 18+
- **Maven** : 3.6+
- **Angular CLI** : 17+

### Installation et lancement

#### 1. Backend (Spring Boot)
```bash
# Dans le dossier backend
mvn spring-boot:run
```
➡️ Accessible sur http://localhost:8080

#### 2. Frontend (Angular)
```bash
# Dans le dossier frontend
npm install
ng serve
```
➡️ Accessible sur http://localhost:4200

#### 3. Base de données (console H2)
➡️ Accessible sur http://localhost:8080/h2-console
- **URL JDBC** : `jdbc:h2:file:./src/main/resources/db/flight_review`
- **Username** : `dbFlightReview`
- **Password** : (vide)

---

## Backend - Spring Boot

### Technologies utilisées
- **Spring Boot** 3.5.3
- **Java** 17
- **JPA/Hibernate** : ORM et gestion des données
- **H2 Database** : Base de données embarquée
- **Bean Validation** : Validation des données
- **Lombok** : Réduction du code boilerplate

### Architecture Générale

#### Structure en Couches
L'application suit une architecture en couches classique Spring Boot :
- **Controller** : Couche présentation (API REST)
- **Service** : Couche logique métier
- **Repository** : Couche d'accès aux données
- **Entity** : Couche modèle de données

```
┌─────────────────┐
│   Controllers   │ ← API REST endpoints
├─────────────────┤
│    Services     │ ← Logique métier
├─────────────────┤
│  Repositories   │ ← Accès données JPA
├─────────────────┤
│    Entities     │ ← Modèle de données
└─────────────────┘
```

### Modélisation des Données (JPA/Hibernate)

#### Entités

##### 1. FlightReview (Entité Principale)
```java
@Entity
@Table(name = "flight_reviews")
```

**Attributs principaux :**
- `id` : Clé primaire auto-générée
- `flightNumber` : Numéro de vol (obligatoire)
- `airline` : Compagnie aérienne (obligatoire)
- `flightDate` : Date du vol
- `rating` : Note de 1 à 5
- `comment` : Commentaire (10-1000 caractères)
- `createdAt` : Date de création automatique
- `status` : Statut de l'avis (enum)

**Validations Bean Validation :**
- `@NotBlank` pour les champs obligatoires
- `@NotNull` pour la date et la note
- `@Min/@Max` pour la note (1-5)
- `@Size` pour la longueur du commentaire

##### 2. AdminResponse (Réponses Administrateur)
```java
@Entity
@Table(name = "admin_responses")
```

**Attributs principaux :**
- `id` : Clé primaire auto-générée
- `responseText` : Texte de la réponse (10-1000 caractères)
- `createdAt` : Date de création automatique
- `adminName` : Nom de l'administrateur
- `flightReview` : Référence vers l'avis

##### 3. ReviewStatus (Énumération)
```java
public enum ReviewStatus {
    PENDING,    // En attente de modération
    PUBLISHED,  // Publié et visible
    REJECTED,   // Rejeté par l'admin
    RESPONDED   // Admin a répondu
}
```

### Relations Entre Entités

#### Relation OneToOne bidirectionnelle
```java
// Dans FlightReview
@OneToOne(mappedBy = "flightReview", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
private AdminResponse adminResponse;

// Dans AdminResponse
@OneToOne
@JoinColumn(name = "flight_review_id", nullable = false)
@JsonIgnore // Évite la sérialisation circulaire
private FlightReview flightReview;
```

**Justification du choix :**
- **OneToOne** : Un avis ne peut avoir qu'une seule réponse admin
- **CascadeType.ALL** : Suppression en cascade
- **FetchType.EAGER** : Charge la réponse avec l'avis (données liées)
- **@JsonIgnore** : Évite les références circulaires lors de la sérialisation JSON

### Choix de la Base de Données

#### H2 Database (Embarquée)

**Configuration :**
```properties
spring.datasource.url=jdbc:h2:file:./src/main/resources/db/flight_review
spring.datasource.username=dbFlightReview
spring.jpa.hibernate.ddl-auto=update
spring.h2.console.enabled=true
```

**Justifications :**
- **Simplicité** : Base embarquée, pas d'installation externe
- **Test technique** : Facilite l'évaluation
- **Console web** : Debug facile via `/h2-console`
- **Persistance fichier** : Les données survivent aux redémarrages, ne sont pas supprimées à chaque lancement


### Séparation des Responsabilités

#### Controllers
**Responsabilités :**
- Validation des entrées (`@Valid`)
- Mapping des requêtes HTTP
- Gestion des codes de retour HTTP
- Sérialisation/désérialisation JSON

**Exemple - FlightReviewController :**
```java
@RestController
@RequestMapping("/api/reviews")
@Validated
public class FlightReviewController {
    // Injection par constructeur (bonne pratique)
    private final FlightReviewService flightReviewService;
}
```

#### Services
**Responsabilités :**
- Logique métier
- Orchestration des opérations
- Gestion des transactions (`@Transactional`)

**Exemple - FlightReviewService :**
```java
@Service
@Transactional
public class FlightReviewService {
    // Logique métier centralisée
    // Gestion des transactions
}
```

#### Repositories
**Responsabilités :**
- Accès aux données uniquement
- Requêtes personnalisées JPQL
- Extension de `JpaRepository`

**Exemples de requêtes personnalisées :**
```java
// Requête pour avis sans réponse
@Query("SELECT fr FROM FlightReview fr WHERE fr.adminResponse IS NULL")
List<FlightReview> findReviewsWithoutResponse();

// Recherche multicritères avec paramètres optionnels
@Query("SELECT fr FROM FlightReview fr WHERE " +
       "(:airline IS NULL OR LOWER(fr.airline) LIKE LOWER(CONCAT('%', :airline, '%')))")
Page<FlightReview> findByMultipleCriteria(...);
```

### API REST - Endpoints

#### FlightReview API
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/reviews` | Création d'un nouvel avis |
| `GET` | `/api/reviews` | Liste paginée (back-office) |
| `GET` | `/api/reviews/{id}` | Détail d'un avis spécifique |
| `GET` | `/api/reviews/public` | Avis publiés (interface publique) |
| `GET` | `/api/reviews/no-response` | Avis sans réponse admin |
| `GET` | `/api/reviews/search` | Recherche multicritères |
| `GET` | `/api/reviews/search-keyword` | Recherche par mot-clé |
| `PUT` | `/api/reviews/{id}/status` | Mise à jour du statut |

#### AdminResponse API
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/admin-responses` | Création d'une réponse admin |

### Fonctionnalités avancées

#### Pagination et tri
```java
public Page<FlightReview> getAllReviews(int page, int size, String sortBy, String sortDir) {
    Sort sort = sortDir.equalsIgnoreCase("desc") ? 
        Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
    Pageable pageable = PageRequest.of(page, size, sort);
    return flightReviewRepository.findAll(pageable);
}
```

#### Recherche multicritères
Recherche flexible avec paramètres optionnels :
- Compagnie aérienne
- Numéro de vol
- Note (rating)
- Statut
- Date de vol
- Mot-clé dans le commentaire

#### Validation des données
- `@NotBlank` pour les champs obligatoires
- `@NotNull` pour la date et la note
- `@Min/@Max` pour la note (1-5)
- `@Size` pour la longueur du commentaire (10-1000 caractères)

### Gestion des Erreurs

#### Stratégie Adoptée
```java
try {
    // Opération métier
    return new ResponseEntity<>(result, HttpStatus.OK);
} catch (RuntimeException e) {
    return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
} catch (Exception e) {
    return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
}
```

---

## Frontend - Angular

### Architecture Générale

#### Structure en Couches
```
┌─────────────────┐
│   Components    │ ← Interface utilisateur
├─────────────────┤
│    Services     │ ← Logique métier et API
├─────────────────┤
│     Models      │ ← Types et interfaces
├─────────────────┤
│   HTTP Client   │ ← Communication avec l'API
└─────────────────┘
```

### Technologies utilisées
- **Angular** 17+ avec standalone components
- **TypeScript** : Typage statique fort
- **RxJS** : Programmation réactive avec Observables
- **Angular Reactive Forms** : Gestion avancée des formulaires
- **Bootstrap 5** : Framework CSS responsive
- **Font Awesome** : Icônes vectorielles
- J'ai personnellemnt préféré ne pas utiliser DAISY parce que je voulais testé quelque chose de différent avec Bootstrap.
- **DAISY** c'est vraiment pour Air France et vu que ce projet peut être un cas général, j'ai préféré ne pas l'utiliser.

### Structure des composants

#### 1. HomeComponent - Page d'accueil
**Responsabilités :**
- Navigation vers les différentes sections
- Lien d'accès au back-office administrateur

#### 2. ReviewFormComponent - Formulaire d'avis
**Responsabilités :**
- Création d'avis de vol avec validation complète
- Interface utilisateur intuitive avec système d'étoiles
- Gestion des erreurs et messages de succès

#### 3. PublicReviewsComponent - Affichage public
**Responsabilités :**
- Affichage des avis publiés dans une interface élégante
- Système de cartes responsive avec informations complètes
- Gestion des états de chargement et d'erreur

#### 4. AdminDashboardComponent - Interface d'administration
**Responsabilités :**
- Gestion complète des avis (modération, réponses)
- Système de recherche et filtrage avancé
- Interface pour visualiser les détails d'un avis

### Service FlightReviewService

#### Architecture du Service

**Responsabilités :**
- Communication avec l'API Spring Boot
- Gestion des erreurs HTTP
- Transformation des données
- Méthodes utilitaires pour l'UI

```typescript
@Injectable({
  providedIn: 'root'
})
export class FlightReviewService {
  private readonly API_URL = '/api';
  
  constructor(private http: HttpClient) { }
}
```

### Méthodes API Principales

#### Gestion des Avis
```typescript
// Création d'avis
createReview(reviewData: CreateFlightReviewRequest): Observable<FlightReview>

// Récupération avec filtres
searchReviews(filters: ReviewSearchFilters, page: number = 0, size: number = 10): Observable<PagedResponse<FlightReview>>

// Avis publics
getPublishedReviews(): Observable<FlightReview[]>

// Avis sans réponse
getReviewsWithoutResponse(): Observable<FlightReview[]>

// Mise à jour de statut
updateReviewStatus(id: number, status: ReviewStatus): Observable<FlightReview>
```

#### Gestion des Réponses Admin
```typescript
// Création de réponse
createAdminResponse(responseData: CreateAdminResponseRequest): Observable<AdminResponse>
```

#### Méthodes Utilitaires
```typescript
// Formatage des étoiles
formatRatingAsStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

// Formatage des statuts
formatStatus(status: ReviewStatus): string {
    const statusMap = {
        'PENDING': 'En attente',
        'PUBLISHED': 'Publié',
        'REJECTED': 'Rejeté',
        'RESPONDED': 'Répondu'
    };
    return statusMap[status] || status;
}

// Options de compagnies
getAirlineOptions(): string[] {
    return [
        'Air France', 'British Airways', 'Lufthansa',
        'KLM', 'Emirates', 'Qatar Airways', // ...
    ];
}
```

### Modèles TypeScript

#### Interfaces principales
```typescript
// Modèle principal d'avis
export interface FlightReview {
  id?: number;
  flightNumber: string;
  airline: string;
  flightDate: string;
  rating: number;
  comment: string;
  createdAt?: string;
  status?: ReviewStatus;
  adminResponse?: AdminResponse;
}

// Réponse administrateur
export interface AdminResponse {
  id?: number;
  responseText: string;
  createdAt?: string;
  adminName?: string;
  flightReviewId?: number;
}

// Énumération des statuts
export enum ReviewStatus {
  PENDING = 'PENDING',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
  NO_RESPONSE = 'NO_RESPONSE'
}
```

### Configuration du routing
```typescript
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'laisser-avis', component: ReviewFormComponent },
  { path: 'avis-publics', component: PublicReviewsComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: '**', redirectTo: '' }
];
```

**Justifications des routes :**
- **URLs françaises** : UX adaptée au public francophone
- **Redirection wildcard** : Gestion des 404 vers l'accueil
- **Routes courtes** : Mémorisation facile pour les utilisateurs

### Communication Frontend/Backend

#### Configuration du proxy de développement
Créer `proxy.conf.json` :
```json
{
  "/api/*": {
    "target": "http://localhost:8080",
    "secure": true,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

Modifier `angular.json` :
```json
"serve": {
  "builder": "@angular-devkit/build-angular:dev-server",
  "options": {
    "proxyConfig": "proxy.conf.json"
  }
}
```

---

## Dépendances

### Backend (pom.xml)
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
    </dependency>
</dependencies>
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "@angular/core": "^17.x",
    "@angular/common": "^17.x",
    "@angular/forms": "^17.x",
    "@angular/router": "^17.x",
    "@angular/platform-browser": "^17.x",
    "rxjs": "^7.x",
    "bootstrap": "^5.x",
    "@fortawesome/fontawesome-free": "^6.x"
  }
}
```

## Bonnes pratiques implémentées

### Architecture
- **Séparation des responsabilités** : Couches bien définies (Controller/Service/Repository)
- **Injection de dépendances** : Pattern d'inversion de contrôle
- **Standalone Components** : Architecture Angular moderne
- **Reactive Programming** : Utilisation d'Observables (RxJS)

### Qualité du code
- **Typage fort** : TypeScript côté frontend, Java avec génériques côté backend
- **Validation** : Bean Validation (backend) + Angular Reactive Forms (frontend)
- **Gestion d'erreurs** : Try/catch appropriés et retours HTTP cohérents
- **Code modulaire** : Composants et services réutilisables

### Base de données
- **Relations JPA** : Mappings appropriés avec stratégies de fetch
- **Transactions** : Gestion automatique avec `@Transactional`
- **Requêtes optimisées** : JPQL pour les cas d'usage spécifiques

### UX/UI
- **Interface moderne** : Bootstrap 5
- **Messages utilisateur** : Gestion des états de chargement et d'erreur
- **Navigation intuitive** : URLs françaises et redirection 404

## Évolutions possibles

- **Authentification** : Système de login/logout

## Utilisation de l'IA dans le développement

### Approche méthodologique avec l'assistance IA

Dans le cadre de ce test technique, j'ai utilisé l'IA comme outil d'assistance pour optimiser ma productivité tout en conservant la maîtrise technique du développement.

#### 1. Compréhension des exigences - TALIA
**Objectif** : Validation de la compréhension du sujet donné
- **Usage** : Analyse et clarification des spécifications du test technique
- **Bénéfice** : Assurance d'une interprétation correcte de ce qui était attendu
- **Résultat** : Définition précise du périmètre fonctionnel et technique

#### 2. Développement CSS - TALIA
**Objectif** : Accélération du développement frontend
- **Usage** : Génération rapide des classes CSS pour les composants Angular
- **Domaines** : Styles Bootstrap personnalisés, animations, layouts responsives
- **Bénéfice** : Gain de temps significatif sur la partie styling
- **Approche** : Génération assistée puis personnalisation manuelle

#### 3. Développement Backend - GitHub Copilot
**Objectif** : Optimisation de la productivité de codage Java
- **Usage** : Autocomplétion intelligente et suggestions de code
- **Domaines** :
    - Génération des entités JPA avec annotations
    - Implémentation des méthodes de service
    - Création des endpoints REST
    - Requêtes JPQL personnalisées
- **Bénéfice** : Réduction du temps de frappe et diminution des erreurs de syntaxe
- **Approche** : Suggestions validées et adaptées selon les bonnes pratiques

### Impact sur le développement

#### Gains de productivité mesurés
- **Développement CSS** : Réduction de ~70% du temps de création des styles
- **Code Java** : Accélération de ~40% de l'écriture du code backend
- **Compréhension projet** : Validation rapide des exigences en amont

#### Maintien de la qualité
- **Contrôle** : Validation systématique de tout code généré
- **Tests manuels** : Vérification fonctionnelle de chaque feature développée
- **Refactoring** : Amélioration du code généré

#### Transparence et apprentissage
- **Compréhension technique** : Analyse de chaque suggestion avant implémentation
- **Adaptation** : Modification du code généré selon mes besoins spécifiques
- **Documentation** : Présente section pour expliquer l'usage de l'IA
