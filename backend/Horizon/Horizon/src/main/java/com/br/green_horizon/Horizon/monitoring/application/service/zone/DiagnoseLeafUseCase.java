package com.br.green_horizon.Horizon.monitoring.application.service.zone;

import com.br.green_horizon.Horizon.monitoring.application.entities.Field;
import com.br.green_horizon.Horizon.monitoring.application.entities.LeafPhoto;
import com.br.green_horizon.Horizon.monitoring.application.entities.StressZone;
import com.br.green_horizon.Horizon.monitoring.application.service.crop.CropCurves;
import com.br.green_horizon.Horizon.monitoring.application.service.field.FieldAccess;
import com.br.green_horizon.Horizon.monitoring.data.response.FieldExtrasResponses;
import com.br.green_horizon.Horizon.monitoring.external.api.CalculationsClient;
import com.br.green_horizon.Horizon.monitoring.external.api.CalculationsClient.DiagnosisContext;
import com.br.green_horizon.Horizon.monitoring.external.api.CalculationsClient.LeafDiagnosisResult;
import com.br.green_horizon.Horizon.monitoring.infrastructure.repository.ILeafPhotoRepository;
import com.br.green_horizon.Horizon.shared.geo.Geo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static com.br.green_horizon.Horizon.shared.format.PtBr.number;

/**
 * Sends a leaf photo to the AI (Gemini, through the calculation service) with the satellite and
 * regional context of the zone, and stores the photo with its diagnosis.
 */
@Service
public class DiagnoseLeafUseCase {

    private static final JsonMapper MAPPER = JsonMapper.builder().build();
    private static final String DEFAULT_CONTENT_TYPE = "image/jpeg";

    private final FieldAccess access;
    private final HypothesisBuilder hypotheses;
    private final CalculationsClient calculations;
    private final ILeafPhotoRepository photoRepository;
    private final Path photosDir;
    private final Clock clock;

    public DiagnoseLeafUseCase(FieldAccess access, HypothesisBuilder hypotheses, CalculationsClient calculations,
                               ILeafPhotoRepository photoRepository,
                               @Value("${storage.photos-dir}") String photosDir, Clock clock) {
        this.access = access;
        this.hypotheses = hypotheses;
        this.calculations = calculations;
        this.photoRepository = photoRepository;
        this.photosDir = Path.of(photosDir);
        this.clock = clock;
    }

    public FieldExtrasResponses.LeafDiagnosis diagnose(String zoneId, Long userId, MultipartFile photo) {
        if (photo == null || photo.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Envie a foto da folha.");
        }
        FieldAccess.ZoneInField target = access.zone(zoneId, userId);
        StressZone zone = target.zone();
        Field field = target.field();
        String contentType = photo.getContentType() == null ? DEFAULT_CONTENT_TYPE : photo.getContentType();
        byte[] bytes = readBytes(photo);

        LeafDiagnosisResult result = calculations.diagnoseLeaf(bytes, filename(photo), contentType, context(field, zone));

        LeafPhoto stored = new LeafPhoto();
        stored.setZoneId(zone.getId());
        stored.setUserId(userId);
        stored.setPath(store(bytes, result.photoSha256(), contentType).toString());
        stored.setSha256(result.photoSha256());
        stored.setLabel(result.label());
        stored.setConfidence(result.confidence());
        stored.setResultJson(MAPPER.writeValueAsString(result));
        stored.setCreatedAt(LocalDateTime.now(clock));
        photoRepository.save(stored);

        return new FieldExtrasResponses.LeafDiagnosis(
                result.label(),
                result.scientificName(),
                Geo.round(result.confidence(), 2),
                result.alternatives().stream()
                        .map(a -> new FieldExtrasResponses.ClassScore(a.label(), Geo.round(a.confidence(), 2)))
                        .toList(),
                result.model(),
                new FieldExtrasResponses.PlainExplanation(result.explanation().summary(),
                        result.explanation().whatToDo(), result.explanation().caution()));
    }

    private DiagnosisContext context(Field field, StressZone zone) {
        int dap = (int) ChronoUnit.DAYS.between(field.getPlantedAt(), zone.getDetectedAt());
        List<String> nearby = hypotheses.nearbyOutbreaks(zone).stream()
                .limit(3)
                .map(o -> o.disease() + " a " + number(o.distanceKm(), 0) + " km")
                .toList();
        return new DiagnosisContext(
                field.getCrop().name(),
                CropCurves.stageAt(field.getCrop(), dap),
                field.getMunicipality(),
                zone.getVigorDropPct(),
                zone.windowDays(),
                HypothesisBuilder.rainVsNormalPct(field, zone.getDetectedAt()),
                nearby);
    }

    private Path store(byte[] bytes, String sha256, String contentType) {
        String extension = switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/heic", "image/heif" -> ".heic";
            default -> ".jpg";
        };
        try {
            Files.createDirectories(photosDir);
            Path target = photosDir.resolve(sha256 + extension);
            if (!Files.exists(target)) {
                Files.write(target, bytes);
            }
            return target;
        } catch (IOException error) {
            throw new UncheckedIOException("Não foi possível salvar a foto.", error);
        }
    }

    private static byte[] readBytes(MultipartFile photo) {
        try {
            return photo.getBytes();
        } catch (IOException error) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não foi possível ler a foto enviada.", error);
        }
    }

    private static String filename(MultipartFile photo) {
        return photo.getOriginalFilename() == null || photo.getOriginalFilename().isBlank()
                ? "folha.jpg"
                : photo.getOriginalFilename();
    }
}
