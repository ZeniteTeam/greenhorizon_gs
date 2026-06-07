package com.br.green_horizon.Horizon.analysis.controllers;

import com.br.green_horizon.Horizon.analysis.application.entities.Analise;
import com.br.green_horizon.Horizon.analysis.application.facade.AnaliseFacade;
import com.br.green_horizon.Horizon.analysis.data.request.CreateAnalysisRequest;
import com.br.green_horizon.Horizon.analysis.data.response.CreateAnalysisResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController("")
public class AnaliseController {

    private final AnaliseFacade facade;

    public AnaliseController(AnaliseFacade facade) {
        this.facade = facade;
    }

    @GetMapping("")
    public ResponseEntity<List<Analise>> GetAll() {
        var list = facade.GetAll();
        return ResponseEntity.ok(list);
    }

    @GetMapping("user/{id}")
    public ResponseEntity<List<Analise>> GetByUserId(@PathVariable Long id) throws Exception {
        var list = facade.GetById(id);
        return ResponseEntity.ok(list);
    }

    @PostMapping("")
    public ResponseEntity<CreateAnalysisResponse> CreateNewAnalysis(@RequestBody CreateAnalysisRequest request) throws Exception {
        var analysis = facade.CreateAnalysis(request);
        return ResponseEntity.ok(analysis);
    }

}
