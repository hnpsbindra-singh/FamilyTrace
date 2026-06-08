package com.testing.springpractice.family_tracker.Controllers;

import com.testing.springpractice.family_tracker.DTO.LoginRequest;
import com.testing.springpractice.family_tracker.DTO.ProfileRequest;
import com.testing.springpractice.family_tracker.DTO.ProfileResponse;
import com.testing.springpractice.family_tracker.DTO.ResetPasswordRequest;
import com.testing.springpractice.family_tracker.Service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthService authService;
    @PostMapping("/register")
    public ProfileResponse register(@RequestBody ProfileRequest request){
        return authService.register(request);
    }

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request){
        return authService.login(request);
    }

    @PostMapping("/send-otp")
    public String sendOtp(@RequestParam String username){
        return authService.sendOtp(username);
    }

    @PostMapping("/verify-otp")
    public String verifyOtp(@RequestParam String Otp, @RequestParam String username){
        return authService.verifyOtp(username, Otp);
    }

    @PostMapping("/send-reset-otp")
    public void sendResetotp(@RequestParam String username){
        try {
            authService.sendResetOtp(username);
        }
        catch (Exception e){
            e.printStackTrace();
        }

    }

    @PostMapping("/reset-password")
    public void resetpassword(@RequestBody ResetPasswordRequest resetPasswordRequest){
        authService.resetPassword(resetPasswordRequest.getUsername(), resetPasswordRequest.getOtp(), resetPasswordRequest.getNewPassword());
    }
}
