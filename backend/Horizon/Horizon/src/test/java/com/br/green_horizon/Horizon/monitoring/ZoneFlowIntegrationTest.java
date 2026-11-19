package com.br.green_horizon.Horizon.monitoring;

import com.br.green_horizon.Horizon.community.application.service.GetCommunityOverviewUseCase;
import com.br.green_horizon.Horizon.monitoring.application.entities.Field;
import com.br.green_horizon.Horizon.monitoring.application.entities.StressZone;
import com.br.green_horizon.Horizon.monitoring.application.enums.ZoneStatus;
import com.br.green_horizon.Horizon.monitoring.application.facade.MonitoringFacade;
import com.br.green_horizon.Horizon.monitoring.external.api.CalculationsClient;
import com.br.green_horizon.Horizon.monitoring.external.api.CalculationsClient.ClassScore;
import com.br.green_horizon.Horizon.monitoring.external.api.CalculationsClient.LeafDiagnosisResult;
import com.br.green_horizon.Horizon.monitoring.external.api.CalculationsClient.PlainExplanation;
import com.br.green_horizon.Horizon.monitoring.external.api.OpenMeteoClient;
import com.br.green_horizon.Horizon.monitoring.infrastructure.repository.IFieldRepository;
import com.br.green_horizon.Horizon.monitoring.infrastructure.repository.ILeafPhotoRepository;
import com.br.green_horizon.Horizon.monitoring.infrastructure.repository.IStressZoneRepository;
import com.br.green_horizon.Horizon.notification.application.facade.NotificationFacade;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Photo → diagnosis → confirmation → community alerts, on the seeded demo data.
 * Only the external services (Python/Gemini and Open-Meteo) are mocked.
 */
@SpringBootTest(properties = "storage.photos-dir=target/test-photos")
class ZoneFlowIntegrationTest {

    private static final long FARMER = 1L;
    private static final long NEIGHBOR = 2L;

    @MockitoBean
    CalculationsClient calculations;
    @MockitoBean
    OpenMeteoClient openMeteo;

    @Autowired
    MonitoringFacade monitoring;
    @Autowired
    IFieldRepository fields;
    @Autowired
    IStressZoneRepository zones;
    @Autowired
    ILeafPhotoRepository photos;
    @Autowired
    NotificationFacade notifications;
    @Autowired
    GetCommunityOverviewUseCase community;

    @Test
    void confirmingAZoneLabelsThePhotoAndAlertsNeighbors() {
        Field field = fields.findById("talhao-3").orElseThrow();
        field.setSyncedAt(Instant.now());
        fields.save(field);
        StressZone zone = zones.save(zoneIn(field));

        when(calculations.diagnoseLeaf(any(), any(), any(), any())).thenReturn(new LeafDiagnosisResult(
                "Ferrugem asiática", "Phakopsora pachyrhizi", 0.874,
                List.of(new ClassScore("Mancha-alvo", 0.081)),
                new PlainExplanation("Pontinhos marrons na folha.", List.of("Chame o técnico."), "É uma suspeita."),
                "Gemini (test)", "abc123"));

        var diagnosis = monitoring.diagnoseLeaf(zone.getId(), FARMER,
                new MockMultipartFile("photo", "folha.jpg", "image/jpeg", new byte[]{1, 2, 3}));
        assertEquals("Ferrugem asiática", diagnosis.label());
        assertEquals(0.87, diagnosis.confidence());

        var detail = monitoring.field("talhao-3", FARMER);
        assertEquals("stress", detail.summary().health());
        assertEquals("pest-or-disease", detail.zones().get(0).hypothesis().kind());

        monitoring.confirmZone(zone.getId(), FARMER, "Ferrugem asiática");

        assertEquals("Ferrugem asiática",
                photos.findFirstByZoneIdOrderByCreatedAtDesc(zone.getId()).orElseThrow().getConfirmedLabel());
        assertTrue(notifications.list(NEIGHBOR).stream().anyMatch(n -> n.kind().equals("outbreak")),
                "neighbor within 15 km should be notified");
        assertTrue(notifications.list(FARMER).stream().anyMatch(n -> n.kind().equals("diagnosis")));

        var overview = community.overview(FARMER, 15);
        var mine = overview.outbreaks().stream().filter(o -> o.id().equals(zone.getId())).findFirst().orElseThrow();
        assertEquals("confirmed", mine.status());
        assertEquals(Boolean.TRUE, mine.isMine());
        assertTrue(overview.alerts().stream().anyMatch(a -> a.title().startsWith("Você confirmou")));
    }

    private static StressZone zoneIn(Field field) {
        StressZone zone = new StressZone();
        zone.setId(field.getId() + "-z1");
        zone.setFieldId(field.getId());
        zone.setPolygon(List.of(
                new double[]{-12.4712, -55.9305}, new double[]{-12.4712, -55.9295},
                new double[]{-12.4700, -55.9295}, new double[]{-12.4700, -55.9305}));
        zone.setAreaHa(1.4);
        zone.setDetectedAt(LocalDate.now().minusDays(2));
        zone.setComparedWith(LocalDate.now().minusDays(12));
        zone.setVigorDropPct(-18);
        zone.setFieldDropPct(-1.2);
        zone.setNdmiBefore(0.30);
        zone.setNdmiAfter(0.29);
        zone.setScoutLat(-12.4706);
        zone.setScoutLng(-55.9300);
        zone.setStatus(ZoneStatus.AWAITING_PHOTO);
        return zone;
    }
}
