package com.testing.springpractice.family_tracker.Repository;

import com.testing.springpractice.family_tracker.Model.Users;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepo extends MongoRepository<Users, String> {
    Users findByUsername(String username);
}
