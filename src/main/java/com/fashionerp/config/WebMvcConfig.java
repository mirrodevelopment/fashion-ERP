package com.fashionerp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addRedirectViewController("/", "/front end/login/login.html");
        registry.addRedirectViewController("/login", "/front end/login/login.html");
        registry.addRedirectViewController("/dashboard", "/front end/dashboard/dashboard.html");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve static resources from classpath:/static/
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/");

        // Map /front end/** to the local front end directory on disk for development
        String frontendUri = Paths.get("front end").toAbsolutePath().toUri().toString();
        if (!frontendUri.endsWith("/")) {
            frontendUri += "/";
        }
        registry.addResourceHandler("/front end/**")
                .addResourceLocations(frontendUri);
    }
}
