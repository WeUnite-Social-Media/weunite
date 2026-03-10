package com.example.weuniteauth.domain.users;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "tb_role")
@NoArgsConstructor
@AllArgsConstructor
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Getter
    public enum Values {
        BASIC(1L),
        ADMIN(2L),
        COMPANY(3L),
        ATHLETE(4L);

        final long roleId;

        Values(long roleId) {
            this.roleId = roleId;
        }

    }
}
