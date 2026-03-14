package com.weunite.api.posts.service;

import com.weunite.api.common.exception.UnauthorizedException;
import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.common.storage.service.CloudinaryService;
import com.weunite.api.posts.domain.Post;
import com.weunite.api.posts.dto.PostDTO;
import com.weunite.api.posts.dto.PostRequestDTO;
import com.weunite.api.posts.exception.PostNotFoundException;
import com.weunite.api.posts.mapper.PostMapper;
import com.weunite.api.posts.repository.PostRepository;
import com.weunite.api.users.domain.User;
import com.weunite.api.users.exception.UserNotFoundException;
import com.weunite.api.users.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class PostService {

  private final UserRepository userRepository;
  private final PostRepository postRepository;
  private final PostMapper postMapper;
  private final CloudinaryService cloudinaryService;

  public PostService(
      UserRepository userRepository,
      PostRepository postRepository,
      PostMapper postMapper,
      CloudinaryService cloudinaryService) {
    this.userRepository = userRepository;
    this.postRepository = postRepository;
    this.postMapper = postMapper;
    this.cloudinaryService = cloudinaryService;
  }

  @Transactional
  public ResponseDTO<PostDTO> createPost(Long userId, PostRequestDTO post, MultipartFile image) {
    User user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);

    String imageUrl = null;

    if (image != null && !image.isEmpty()) {
      imageUrl = cloudinaryService.uploadPost(image, userId);
    }

    Post createdPost = new Post(user, post.text(), imageUrl);

    postRepository.save(createdPost);

    return postMapper.toResponseDTO("Publicação criada com sucesso!", createdPost);
  }

  @Transactional
  public ResponseDTO<PostDTO> updatePost(
      Long userId, Long postId, PostRequestDTO updatedPost, MultipartFile image) {
    Post existingPost = postRepository.findById(postId).orElseThrow(PostNotFoundException::new);

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
    Post post = postRepository.findById(postId).orElseThrow(PostNotFoundException::new);

    return postMapper.toResponseDTO("Publicação consultada com sucesso!", post);
  }

  @Transactional(readOnly = true)
  public List<PostDTO> getPosts() {

    List<Post> posts = postRepository.findAllOrderedByCreationDate();

    return postMapper.toPostDTOList(posts);
  }

  @Transactional
  public ResponseDTO<PostDTO> deletePost(Long userId, Long postId) {
    Post post = postRepository.findById(postId).orElseThrow(PostNotFoundException::new);

    if (!userId.equals(post.getUser().getId())) {
      throw new UnauthorizedException("Você precisa estar logado para deletar essa publicação!");
    }

    postRepository.delete(post);

    return postMapper.toResponseDTO("Publicação excluída com sucesso", post);
  }
}
