package com.example.weuniteauth.service;

import com.example.weuniteauth.domain.post.Post;
import com.example.weuniteauth.domain.users.User;
import com.example.weuniteauth.dto.PostDTO;
import com.example.weuniteauth.dto.ResponseDTO;
import com.example.weuniteauth.dto.post.PostRequestDTO;
import com.example.weuniteauth.exceptions.UnauthorizedException;
import com.example.weuniteauth.exceptions.user.UserNotFoundException;
import com.example.weuniteauth.exceptions.post.PostNotFoundException;
import com.example.weuniteauth.mapper.PostMapper;
import com.example.weuniteauth.repository.PostRepository;
import com.example.weuniteauth.repository.user.UserRepository;
import com.example.weuniteauth.service.cloudinary.CloudinaryService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class PostService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final PostMapper postMapper;
    private final CloudinaryService cloudinaryService;

    public PostService(UserRepository userRepository, PostRepository postRepository, PostMapper postMapper, CloudinaryService cloudinaryService) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.postMapper = postMapper;
        this.cloudinaryService = cloudinaryService;
    }

    @Transactional
    public ResponseDTO<PostDTO> createPost(Long userId, PostRequestDTO post, MultipartFile image) {
        User user = userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);

        String imageUrl = null;

        if (image != null && !image.isEmpty()) {
            imageUrl = cloudinaryService.uploadPost(image, userId);
        }

        Post createdPost = new Post(user, post.text(), imageUrl);

        postRepository.save(createdPost);

        return postMapper.toResponseDTO("Publicação criada com sucesso!", createdPost);
    }

    @Transactional
    public ResponseDTO<PostDTO> updatePost(Long userId, Long postId, PostRequestDTO updatedPost, MultipartFile image) {
        Post existingPost = postRepository.findById(postId)
                .orElseThrow(PostNotFoundException::new);

        if (!userId.equals(existingPost.getUser().getId())) {
            throw new UnauthorizedException("Você precisa estar logado para atualizar esta publicação");
        }

        String imageUrl = existingPost.getImageUrl();

        if (image != null && !image.isEmpty()) {
            imageUrl = cloudinaryService.uploadPost(image, userId);
        }

        existingPost.setText(updatedPost.text());
        existingPost.setImageUrl(imageUrl);
        postRepository.save(existingPost);

        return postMapper.toResponseDTO("Publicação atualizada com sucesso!", existingPost);
    }

    @Transactional(readOnly = true)
    public ResponseDTO<PostDTO> getPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(PostNotFoundException::new);

        return postMapper.toResponseDTO("Publicação consultada com sucesso!", post);
    }

    @Transactional(readOnly = true)
    public List<PostDTO> getPosts() {

        List<Post> posts = postRepository.findAllOrderedByCreationDate();

        return postMapper.toPostDTOList(posts);

    }

    @Transactional
    public ResponseDTO<PostDTO> deletePost(Long userId, Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(PostNotFoundException::new);

        if (!userId.equals(post.getUser().getId())) {
            throw new UnauthorizedException("Você precisa estar logado para deletar essa publicação!");
        }

        postRepository.delete(post);

        return postMapper.toResponseDTO("Publicação excluída com sucesso", post);
    }
}

