package com.nexorcrm.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "rrq")
public class Rrq {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rrq_id", nullable = false, unique = true, length = 64)
    private String rrqId;

    @Column(name = "rrq_name", nullable = false, unique = true, length = 200)
    private String rrqName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rrq_type_id", nullable = false)
    private RrqType rrqType;

    @ManyToMany
    @JoinTable(
            name = "rrq_users",
            joinColumns = @JoinColumn(name = "rrq_id_fk"),
            inverseJoinColumns = @JoinColumn(name = "user_id_fk")
    )
    private Set<User> assignedUsers = new HashSet<>();

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getRrqId() { return rrqId; }
    public void setRrqId(String rrqId) { this.rrqId = rrqId; }
    public String getRrqName() { return rrqName; }
    public void setRrqName(String rrqName) { this.rrqName = rrqName; }
    public RrqType getRrqType() { return rrqType; }
    public void setRrqType(RrqType rrqType) { this.rrqType = rrqType; }
    public Set<User> getAssignedUsers() { return assignedUsers; }
    public void setAssignedUsers(Set<User> assignedUsers) { this.assignedUsers = assignedUsers; }
    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
