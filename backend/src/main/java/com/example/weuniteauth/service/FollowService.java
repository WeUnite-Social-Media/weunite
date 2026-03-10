package com.example.weuniteauth.service;

import com.example.weuniteauth.domain.users.Follow;
import com.example.weuniteauth.domain.users.User;
import com.example.weuniteauth.dto.FollowDTO;
import com.example.weuniteauth.dto.ResponseDTO;
import com.example.weuniteauth.exceptions.follow.FollowNotFoundException;
import com.example.weuniteauth.exceptions.user.UserNotFoundException;
import com.example.weuniteauth.mapper.FollowMapper;
import com.example.weuniteauth.repository.FollowRepository;
import com.example.weuniteauth.repository.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class FollowService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final FollowMapper followMapper;
    private final UserService userService;

    public FollowService(UserRepository userRepository, FollowRepository followRepository, FollowMapper followMapper, UserService userService) {
        this.followMapper = followMapper;
        this.userRepository = userRepository;
        this.followRepository = followRepository;
        this.userService = userService;
    }

    @Transactional
    public ResponseDTO<FollowDTO> followUser(User follower, User followed) {

        Follow follow = new Follow(follower, followed);

        followRepository.save(follow);

        return followMapper.toResponseDTO("Seguiu com sucesso", follow);
    }

    @Transactional
    public ResponseDTO<FollowDTO> unfollowUser(Follow follow) {
        followRepository.delete(follow);

        return followMapper.toResponseDTO("Deixou de seguir com sucesso", follow);
    }

    @Transactional
    public ResponseDTO<FollowDTO> followAndUnfollow(Long followerId, Long followedId) {

        User follower = userRepository.findById(followerId)
                .orElseThrow(UserNotFoundException::new);

        User followed = userRepository.findById(followedId)
                .orElseThrow(UserNotFoundException::new);


        Optional<Follow> existingFollow = followRepository.findByFollowerIdAndFollowedId(followerId, followedId);

        if (existingFollow.isPresent()) {
            return unfollowUser(existingFollow.get());
        } else {
            return followUser(follower, followed);
        }

    }

    @Transactional(readOnly = true)
    public FollowDTO getFollow(Long followerId, Long followedId) {
        User follower = userService.findUserEntityById(followerId);

        User followed = userService.findUserEntityById(followedId);

        Follow follow = new Follow(follower, followed);

        return followMapper.toFollowDTO(follow);
    }

    @Transactional(readOnly = true)
    public ResponseDTO<List<FollowDTO>> getFollowers(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);

        List<Follow> follows = followRepository.findAllByFollowedAndStatus(user, Follow.FollowStatus.ACCEPTED);
        System.out.println("Follows: " + follows.size());

        return followMapper.toResponseDTO("Seguidores consultados com sucesso!", follows);
    }

    @Transactional(readOnly = true)
    public ResponseDTO<List<FollowDTO>> getFollowing(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);

        List<Follow> follows = followRepository.findAllByFollowerAndStatus(user, Follow.FollowStatus.ACCEPTED);

        return followMapper.toResponseDTO("Seguindo consultados com sucesso!", follows);
    }

    @Transactional
    public ResponseDTO<FollowDTO> acceptFollowRequest(Long followerId, Long followedId) {
        Follow follow = followRepository.findByFollowerIdAndFollowedId(followerId, followedId)
                .orElseThrow(FollowNotFoundException::new);

        follow.accept();
        followRepository.save(follow);

        return followMapper.toResponseDTO("Solicitação de seguimento aceita com sucesso!", follow);
    }

    @Transactional
    public ResponseDTO<FollowDTO> declineFollowRequest(Long followerId, Long followedId) {
        Follow follow = followRepository.findByFollowerIdAndFollowedId(followerId, followedId)
                .orElseThrow(FollowNotFoundException::new);

        follow.decline();
        followRepository.save(follow);

        return followMapper.toResponseDTO("Solicitação de seguimento recusada com sucesso!", follow);
    }


}
