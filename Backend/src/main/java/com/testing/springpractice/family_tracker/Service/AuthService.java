package com.testing.springpractice.family_tracker.Service;

import com.testing.springpractice.family_tracker.DTO.LoginRequest;
import com.testing.springpractice.family_tracker.DTO.ProfileRequest;
import com.testing.springpractice.family_tracker.DTO.ProfileResponse;
import com.testing.springpractice.family_tracker.Model.Users;
import com.testing.springpractice.family_tracker.Repository.UserRepo;
import com.testing.springpractice.family_tracker.Security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class AuthService {
    @Autowired
    PasswordEncoder passwordEncoder;
    @Autowired
    UserRepo userRepo;
    @Autowired
    JwtUtils jwtUtil;
    @Autowired
    AuthenticationManager authenticationManager;
    @Autowired
    EmailService emailService;
    public ProfileResponse register(ProfileRequest request) {
        Users users = new Users();
        if(userRepo.findByUsername(request.getUsername()) != null){
            throw new RuntimeException("Username already exists");
        }
        users.setName(request.getName());
        users.setVerified(false);
        users.setPassword(passwordEncoder.encode(request.getPassword()));
        users.setRole(request.getRole());
        users.setUsername(request.getUsername());
        Users saved =userRepo.save(users);
        return mapToProfileResponse(saved);
    }

    private ProfileResponse mapToProfileResponse(Users saved) {
        ProfileResponse response = new ProfileResponse();
        response.setId(saved.getId());
        response.setName(saved.getName());
        response.setRole(saved.getRole());
        response.setUsername(saved.getUsername());
        return response;
    }

    public String login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(),
                        request.getPassword()));

        Users user = userRepo.findByUsername(request.getUsername());
        if(!user.isVerified()){
            throw new RuntimeException("User not Verified");
        }
        return jwtUtil.generateToken(request.getUsername(), user.getRole());
    }

    public String sendOtp(String username) {

        Random random = new Random();
        String otp = String.valueOf(100000 + random.nextInt(900000));
        long expiry = System.currentTimeMillis() + (15*60*1000);
        Users user = userRepo.findByUsername(username);
        if(user == null) {

            throw new RuntimeException(
                    "User not found"
            );
        }
        user.setOtp(otp);
        user.setOtpExpiresAt(expiry);
        userRepo.save(user);

        emailService.sendOtp(username, otp);
        return "Otp Sent Successfully";
    }

    public String sendResetOtp(String username) {

        Random random = new Random();
        String otp = String.valueOf(100000 + random.nextInt(900000));
        long expiry = System.currentTimeMillis() + (15*60*1000);
        Users user = userRepo.findByUsername(username);
        if(user == null) {

            throw new RuntimeException(
                    "User not found"
            );
        }
        user.setOtp(otp);
        user.setOtpExpiresAt(expiry);
        userRepo.save(user);

        emailService.sendOtp(username, otp);
        return "Otp Sent Successfully";
    }

    public String verifyOtp(String username, String otp) {

        Users user = userRepo.findByUsername(username);
        if(user==null){
            throw new RuntimeException("user not found");
        }
        if(user.getOtp() == null) {
            return "OTP not generated";
        }
        if(System.currentTimeMillis()>user.getOtpExpiresAt()){
            throw new RuntimeException("Otp expired");
        }
        if(!otp.equals(user.getOtp())){
            throw new RuntimeException("Incorrect Otp");
        }
        user.setVerified(true);
        user.setOtp(null);
        user.setOtpExpiresAt(null);

        userRepo.save(user);
        return "Verified Successfully";
    }

    public void resetPassword(String username,String Otp, String password){
        Users user = userRepo.findByUsername(username);
        if(user==null){
            throw new RuntimeException("Invalid Username");
        }
        if(user.getOtp() == null) {
            throw new RuntimeException("OTP not generated");
        }
        if(System.currentTimeMillis()>user.getOtpExpiresAt()){
            throw new RuntimeException("Otp expired");
        }
        if(!Otp.equals(user.getOtp())){
            throw new RuntimeException("Incorrect Otp");
        }

        user.setPassword(passwordEncoder.encode(password));
        user.setOtp(null);
        user.setOtpExpiresAt(null);

        userRepo.save(user);


    }
}
