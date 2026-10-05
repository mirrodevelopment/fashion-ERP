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

                    com.fashionerp.common.TenantContext.setCompanyId(companyId);
                    com.fashionerp.common.TenantContext.setAssignedBranch(assignedBranch);
                    com.fashionerp.common.TenantContext.setUserRole(role);

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
