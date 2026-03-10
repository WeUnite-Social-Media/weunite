package com.example.weuniteauth.service.cloudinary;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.example.weuniteauth.config.CloudinaryImageProperties;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;
    private final CloudinaryImageProperties imageProperties;

    public CloudinaryService(Cloudinary cloudinary, CloudinaryImageProperties imageProperties) {
        this.cloudinary = cloudinary;
        this.imageProperties = imageProperties;
    }

    public String uploadPost(MultipartFile file, Long userId) {
        try {
            // Primeiro, fazemos upload temporário para analisar dimensões
            Map<?, ?> tempUpload = cloudinary.uploader().upload(file.getBytes(), Map.of("resource_type", "auto"));

            int originalWidth = (Integer) tempUpload.get("width");
            int originalHeight = (Integer) tempUpload.get("height");
            String publicId = (String) tempUpload.get("public_id");

            // Calcula a proporção da imagem
            double aspectRatio = (double) originalWidth / originalHeight;

            Transformation transformation;
            String tags;

            // Aplica estratégias baseadas na orientação
            if (aspectRatio > 1.0) {
                // IMAGEM HORIZONTAL - usa dimensões completas
                transformation = new Transformation()
                        .width(imageProperties.getPost().getWidth())   // 1280px
                        .height(imageProperties.getPost().getHeight()) // 720px
                        .crop("limit") // Mantém proporção
                        .quality("auto")
                        .fetchFormat("auto");
                tags = "post, user_content, horizontal";
            } else {
                // IMAGEM VERTICAL - usa limites reduzidos
                transformation = new Transformation()
                        .width(imageProperties.getPost().getVerticalMaxWidth())   // 375px
                        .height(imageProperties.getPost().getVerticalMaxHeight()) // 500px
                        .crop("limit") // Mantém proporção
                        .quality("auto")
                        .fetchFormat("auto");
                tags = "post, user_content, vertical";
            }

            // Remove imagem temporária
            cloudinary.uploader().destroy(publicId, Map.of());

            // Faz upload final com transformação correta
            Map<String, Object> options = Map.of(
                    "folder", "posts/" + userId,
                    "tags", tags,
                    "transformation", transformation,
                    "resource_type", "auto"
            );

            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), options);
            return (String) uploadResult.get("secure_url");

        } catch (IOException e) {
            throw new RuntimeException("Erro ao fazer upload da imagem do post", e);
        }
    }

    public String uploadProfileImg(MultipartFile file, String username) {

        int profileHeight = imageProperties.getProfile().getHeight();

        // Imagem de perfil será exibida como uma bolinha (circular) no frontend
        Transformation transformation = new Transformation()
                .width(profileHeight)
                .height(profileHeight)
                .crop("fill")
                .gravity("face")
                .quality("auto")
                .fetchFormat("auto");

        Map<String, Object> options = Map.of(
                "folder", "profile/" + username,
                "tags", "profile, img, circular",
                "transformation", transformation,
                "resource_type", "auto"
        );

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), options);
            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            throw new RuntimeException("Erro ao fazer upload da imagem de perfil", e);
        }
    }

    public String uploadBannerImg(MultipartFile file, String username) {

        Transformation transformation = new Transformation()
                .height(imageProperties.getBanner().getHeight())
                .crop("fill")
                .gravity("center")
                .quality("auto")
                .fetchFormat("auto");

        Map<String, Object> options = Map.of(
                "folder", "banner/" + username,
                "tags", "profile, img, banner",
                "transformation", transformation,
                "resource_type", "auto"
        );

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), options);
            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            throw new RuntimeException("Erro ao fazer upload da imagem de banner", e);
        }
    }

    /**
     * Get image URL with custom height while maintaining aspect ratio
     */
    public String getImageWithHeight(String publicId, int height) {
        return cloudinary.url()
                .transformation(new Transformation()
                        .height(height)
                        .crop("limit")
                        .quality("auto")
                        .fetchFormat("auto"))
                .generate(publicId);
    }

    /**
     * Get the configured height values for different image types
     */
    public CloudinaryImageProperties getImageProperties() {
        return imageProperties;
    }
}
