package com.testing.springpractice.family_tracker.Service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;


    public String sendMessage(
            String username,
            String subject,
            String message) {

        SimpleMailMessage mailMessage =
                new SimpleMailMessage();

        mailMessage.setTo(username);
        mailMessage.setSubject(subject);
        mailMessage.setText(message + "\n\n" + "-Sent By your family member");

        mailSender.send(mailMessage);

        return "Message Sent Successfully";
    }
    public String sendOtp(String username, String otp) {

        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(username);
        mailMessage.setSubject("Here is Your otp " + otp);
        mailMessage.setText(
                "Hi,\n\n" +

                        "Your verification code is:\n\n" +

                        otp + "\n\n" +

                        "— Team Tracking"
        );
        mailSender.send(mailMessage);
        return "OTP Sent Successfully";
    }
}
