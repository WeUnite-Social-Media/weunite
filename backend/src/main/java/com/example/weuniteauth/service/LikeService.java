package com.example.weuniteauth.service;

import com.example.weuniteauth.domain.post.Comment;
import com.example.weuniteauth.domain.post.Like;
import com.example.weuniteauth.domain.post.Post;
import com.example.weuniteauth.domain.users.User;
import com.example.weuniteauth.dto.LikeDTO;
import com.example.weuniteauth.dto.ResponseDTO;
import com.example.weuniteauth.exceptions.comment.CommentNotFoundException;
import com.example.weuniteauth.exceptions.post.PostNotFoundException;
import com.example.weuniteauth.exceptions.user.UserNotFoundException;
import com.example.weuniteauth.mapper.LikeMapper;
import com.example.weuniteauth.repository.CommentRepository;
import com.example.weuniteauth.repository.LikeRepository;
import com.example.weuniteauth.repository.PostRepository;
import com.example.weuniteauth.repository.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Set;

@Service
public class LikeService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;
    private final LikeMapper likeMapper;

    public LikeService(UserRepository userRepository, PostRepository postRepository, CommentRepository commentRepository, LikeRepository likeRepository, LikeMapper likeMapper) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.likeRepository = likeRepository;
        this.likeMapper = likeMapper;
    }

    @Transactional
    public ResponseDTO<LikeDTO> toggleLike(Long userId, Long postId) {

        User user = userRepository.findById(userId).
                orElseThrow(UserNotFoundException::new);

        Post post = postRepository.findById(postId)
                .orElseThrow(PostNotFoundException::new);

        Like existingLike = likeRepository.findByUserAndPost(user, post)
                .orElse(null);

        if (existingLike == null) {
            Like newLike = new Like(post, user);
            post.addLike(newLike);
            likeRepository.save(newLike);
            return likeMapper.toResponseDTO( "Curtida criada com sucesso!", newLike);
        } else {
            post.removeLike(existingLike);
            likeRepository.delete(existingLike);
            return likeMapper.toResponseDTO("Curtida deletada com sucesso!", existingLike);
        }

    }

    @Transactional
    public ResponseDTO<LikeDTO> toggleLikeComment(Long userId, Long commentId) {

        User user = userRepository.findById(userId).
                orElseThrow(UserNotFoundException::new);

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(CommentNotFoundException::new);

        Like existingLike = likeRepository.findByUserAndComment(user, comment)
                .orElse(null);

        if (existingLike == null) {
            Like newLike = new Like(comment, user);
            comment.addLike(newLike);
            likeRepository.save(newLike);
            return likeMapper.toResponseDTO( "Curtida criada com sucesso!", newLike);
        } else {
            comment.removeLike(existingLike);
            likeRepository.delete(existingLike);
            return likeMapper.toResponseDTO("Curtida deletada com sucesso!", existingLike);
        }

    }

    @Transactional(readOnly = true)
    public ResponseDTO<List<LikeDTO>> getLikes(Long userId) {
        User user = userRepository.findById(userId).
                orElseThrow(UserNotFoundException::new);

        Set<Like> likes = likeRepository.findByUser(user);

        return likeMapper.toResponseDTO("Likes consultados com sucesso!", likes);
    }

    @Transactional(readOnly = true)
    public ResponseDTO<List<LikeDTO>> getLikes(Long userId, int pagina, int items) {
        User user = userRepository.findById(userId).
                orElseThrow(UserNotFoundException::new);

        Pageable pageable = PageRequest.of(pagina, items);

        Page<Like> likes = likeRepository.findByUser(user, pageable);

        return likeMapper.toResponseDTO("Likes consultados com sucesso!", likes.getContent());
    }

    @Transactional(readOnly = true)
    public ResponseDTO<List<LikeDTO>> getCommentLikes(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(CommentNotFoundException::new);

        Set<Like> likes = likeRepository.findByComment(comment);

        return likeMapper.toResponseDTO("Curtidas do comentário consultadas com sucesso!", likes);
    }
}
