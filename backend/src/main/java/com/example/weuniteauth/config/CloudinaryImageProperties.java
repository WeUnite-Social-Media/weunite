package com.example.weuniteauth.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "cloudinary.image")
public class CloudinaryImageProperties {

    private Profile profile = new Profile();
    private Banner banner = new Banner();
    private Post post = new Post();

    @Getter
    @Setter
    public static class Profile {
        private int height = 400;
    }

    @Getter
    @Setter
    public static class Banner {
        private int height = 300;
    }

    @Getter
    @Setter
    public static class Post {
        private int height = 720;
        private int width = 1280; // 16:9 aspect ratio - HD resolution
        private int verticalMaxHeight = 500; // For vertical images
        private int verticalMaxWidth = 375; // For vertical images
    }
}
