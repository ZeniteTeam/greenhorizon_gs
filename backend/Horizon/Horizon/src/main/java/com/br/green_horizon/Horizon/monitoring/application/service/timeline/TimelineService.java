package com.br.green_horizon.Horizon.monitoring.application.service.timeline;

import com.br.green_horizon.Horizon.monitoring.application.entities.Field;
import com.br.green_horizon.Horizon.monitoring.application.entities.FieldEvent;
import com.br.green_horizon.Horizon.monitoring.application.enums.FieldEventKind;
import com.br.green_horizon.Horizon.monitoring.data.response.FieldExtrasResponses;
import com.br.green_horizon.Horizon.monitoring.infrastructure.repository.IFieldEventRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import static com.br.green_horizon.Horizon.shared.format.PtBr.number;

/** A field's timeline: stored events plus the planting date. */
@Service
public class TimelineService {

    private static final String NOTE_TITLE = "Anotação";
    private static final String DEFAULT_AUTHOR = "Produtor";

    private final IFieldEventRepository repository;

    public TimelineService(IFieldEventRepository repository) {
        this.repository = repository;
    }

    public FieldEvent record(String fieldId, LocalDate date, FieldEventKind kind, String title, String description,
                             String author) {
        FieldEvent event = new FieldEvent();
        event.setFieldId(fieldId);
        event.setDate(date);
        event.setKind(kind);
        event.setTitle(title);
        event.setDescription(description);
        event.setAuthor(author);
        return repository.save(event);
    }

    public List<FieldExtrasResponses.FieldEvent> list(Field field) {
        List<FieldEvent> stored = new ArrayList<>(repository.findByFieldId(field.getId()));
        stored.sort(Comparator.comparing(FieldEvent::getDate).thenComparing(FieldEvent::getId).reversed());

        List<FieldExtrasResponses.FieldEvent> events = new ArrayList<>(stored.stream().map(TimelineService::toResponse).toList());
        events.add(new FieldExtrasResponses.FieldEvent(
                "planting-" + field.getId(),
                field.getPlantedAt().toString(),
                FieldEventKind.planting.name(),
                "Plantio",
                field.getCrop().name() + " · " + number(field.areaHa(), 1) + " ha",
                null));
        return events;
    }

    public FieldExtrasResponses.FieldEvent addNote(Field field, String text, String author, LocalDate today) {
        String writer = author == null || author.isBlank() ? DEFAULT_AUTHOR : author.trim();
        return toResponse(record(field.getId(), today, FieldEventKind.note, NOTE_TITLE, text.trim(), writer));
    }

    private static FieldExtrasResponses.FieldEvent toResponse(FieldEvent e) {
        return new FieldExtrasResponses.FieldEvent(String.valueOf(e.getId()), e.getDate().toString(), e.getKind().name(),
                e.getTitle(), e.getDescription(), e.getAuthor());
    }
}
