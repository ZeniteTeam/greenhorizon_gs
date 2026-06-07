package com.br.green_horizon.Horizon.user.controllers;

import com.br.green_horizon.Horizon.user.application.facade.UserFacade;
import com.br.green_horizon.Horizon.user.data.request.AuthRequest;
import com.br.green_horizon.Horizon.user.data.response.AuthResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/users")
@RestController("")
public class UserController {

    private final UserFacade facade;

    public UserController(UserFacade facade) { this.facade = facade; }

    @GetMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        var user = facade.Login(request);
        return ResponseEntity.ok(user);
    }

}
