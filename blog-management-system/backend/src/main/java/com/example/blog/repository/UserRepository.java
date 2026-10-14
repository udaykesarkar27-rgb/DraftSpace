package com.example.blog.repository;

import com.example.blog.entity.Role;
import com.example.blog.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByUsernameOrEmail(String username, String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    long countByEnabledFalse();

    @Query("select count(u) from User u join u.roles r where r = :role")
    long countByRole(@Param("role") Role role);
}
