package com.fashionerp.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        try {
            if (header != null && header.startsWith("Bearer ")) {
                String token = header.substring(7);
                if (jwtUtil.isValid(token)) {
                    String username = jwtUtil.getUsername(token);
                    String role = jwtUtil.getRole(token);
                    java.util.UUID companyId = jwtUtil.getCompanyId(token);
                    String assignedBranch = jwtUtil.getAssignedBranch(token);
                    List<String> allowedBranches = jwtUtil.getAllowedBranches(token);
                    if ((allowedBranches == null || allowedBranches.isEmpty()) && assignedBranch != null && !assignedBranch.isBlank()) {
                        allowedBranches = List.of(assignedBranch.trim());
                    }

                    com.fashionerp.common.TenantContext.setCompanyId(companyId);
                    com.fashionerp.common.TenantContext.setAssignedBranch(assignedBranch);
                    com.fashionerp.common.TenantContext.setUserRole(role);
                    com.fashionerp.common.TenantContext.setAllowedBranches(allowedBranches);

                    boolean isOwner = "OWNER".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role);
                    String activeBranchHeader = request.getHeader("X-Active-Branch");

                    if (activeBranchHeader != null && !activeBranchHeader.isBlank()
                            && !"ALL".equalsIgnoreCase(activeBranchHeader.trim())
                            && !"All Company Data".equalsIgnoreCase(activeBranchHeader.trim())) {
                        String branch = activeBranchHeader.trim();
                        if (isOwner || (allowedBranches != null && allowedBranches.contains(branch))) {
                            com.fashionerp.common.TenantContext.setActiveBranchFilter(branch);
                        } else {
                            com.fashionerp.common.TenantContext.setActiveBranchFilter(assignedBranch);
                        }
                    } else {
                        if (isOwner) {
                            com.fashionerp.common.TenantContext.setActiveBranchFilter(null);
                        } else {
                            com.fashionerp.common.TenantContext.setActiveBranchFilter(assignedBranch);
                        }
                    }

                    var auth = new UsernamePasswordAuthenticationToken(
                            username, null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + role)));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
            chain.doFilter(request, response);
        } finally {
            com.fashionerp.common.TenantContext.clear();
        }
    }
}
