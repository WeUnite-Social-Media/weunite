package com.example.weuniteauth.service;

import com.example.weuniteauth.domain.post.Comment;
import com.example.weuniteauth.domain.post.Post;
import com.example.weuniteauth.domain.users.User;
import com.example.weuniteauth.dto.CommentDTO;
import com.example.weuniteauth.dto.ResponseDTO;
import com.example.weuniteauth.dto.comment.CommentRequestDTO;
import com.example.weuniteauth.exceptions.UnauthorizedException;
import com.example.weuniteauth.exceptions.comment.CommentNotFoundException;
import com.example.weuniteauth.exceptions.post.PostNotFoundException;
import com.example.weuniteauth.exceptions.user.UserNotFoundException;
import com.example.weuniteauth.mapper.CommentMapper;
import com.example.weuniteauth.repository.CommentRepository;
import com.example.weuniteauth.repository.PostRepository;
import com.example.weuniteauth.repository.user.UserRepository;
import com.example.weuniteauth.service.cloudinary.CloudinaryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class CommentService {

    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final CommentMapper commentMapper;

    public CommentService(UserRepository userRepository, CommentRepository commentRepository, PostRepository postRepository, CommentMapper commentMapper) {
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.commentMapper = commentMapper;
    }

    @Transactional
    public ResponseDTO<CommentDTO> createComment(Long userId, Long postId, CommentRequestDTO comment) {
        User user = userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);

        Post post = postRepository.findById(postId)
                .orElseThrow(PostNotFoundException::new);

        Comment newComment = new Comment(
                user,
                post,
                comment.text(),
                comment.image()
        );

        commentRepository.save(newComment);

        return commentMapper.toResponseDTO("Comentário criado com sucesso!", newComment);
    }


    @Transactional
    public List<CommentDTO> getCommentsByPost(Long postId) {
        if (!postRepository.existsById(postId)) {
            throw new CommentNotFoundException();
        }

        List<Comment> comments = commentRepository.findByPostId(postId);
        return commentMapper.mapCommentsToList(comments);
    }

   @Transactional
    public List<CommentDTO> getCommentsByUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException();

        }
        List<Comment> comments = commentRepository.findByUserId(userId);
        return commentMapper.mapCommentsToList(comments);
    }

    @Transactional
    public ResponseDTO<CommentDTO> updateComment(Long userId, Long commentId, CommentRequestDTO updatedComment, MultipartFile image ) {
        User user = userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);

        Comment existingComment = commentRepository.findById(commentId)
                .orElseThrow(CommentNotFoundException::new);

        if (!userId.equals(existingComment.getUser().getId())) {
            throw new UnauthorizedException("Você precisa estar logado para atualizar este comentário");
        }

        existingComment.setText(updatedComment.text());

        commentRepository.save(existingComment);

        return commentMapper.toResponseDTO("Comentário atualizado com sucesso!", existingComment);
    }

    @Transactional
    public ResponseDTO<CommentDTO> deleteComment(Long userId, Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(CommentNotFoundException::new);

        if (!userId.equals(comment.getUser().getId())) {
            throw new UnauthorizedException("Você precisa estar logado para deletar esse comentário!");
        }

        commentRepository.delete(comment);

        return commentMapper.toResponseDTO("Comentário excluída com sucesso", comment);
    }
}
