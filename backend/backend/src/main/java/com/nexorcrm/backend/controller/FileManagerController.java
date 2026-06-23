package com.nexorcrm.backend.controller;

import com.nexorcrm.backend.entity.UserFile;
import com.nexorcrm.backend.entity.User;
import com.nexorcrm.backend.repo.UserFileRepository;
import com.nexorcrm.backend.repo.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/files")
public class FileManagerController {

    private final UserFileRepository userFileRepository;
    private final UserRepository userRepository;

    public FileManagerController(UserFileRepository userFileRepository, UserRepository userRepository) {
        this.userFileRepository = userFileRepository;
        this.userRepository = userRepository;
    }

    private User getActor(Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        String principal = authentication.getName();
        return principal.contains("@")
                ? userRepository.findByEmailAndIsDeletedFalse(principal.trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED))
                : userRepository.findByUsernameAndIsDeletedFalse(principal.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    @GetMapping
    public List<UserFile> list(
            @RequestParam(value = "parentId", required = false) Long parentId,
            @RequestParam(value = "search", required = false) String search,
            Authentication authentication) {
        User actor = getActor(authentication);
        if (search != null && !search.trim().isEmpty()) {
            return userFileRepository.findByUserIdAndNameContainingIgnoreCase(actor.getId(), search.trim());
        }
        if (parentId != null) {
            return userFileRepository.findByUserIdAndParentId(actor.getId(), parentId);
        }
        return userFileRepository.findByUserIdAndParentIdIsNull(actor.getId());
    }

    @PostMapping
    public UserFile create(@RequestBody UserFile request, Authentication authentication) {
        User actor = getActor(authentication);
        UserFile file = new UserFile();
        file.setName(request.getName());
        file.setSize(request.getSize());
        file.setType(request.getType());
        file.setIsDirectory(request.getIsDirectory() != null && request.getIsDirectory());
        file.setParentId(request.getParentId());
        file.setPath(request.getPath());
        file.setUserId(actor.getId());
        return userFileRepository.save(file);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable("id") Long id, Authentication authentication) {
        User actor = getActor(authentication);
        UserFile file = userFileRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found"));
        if (!file.getUserId().equals(actor.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        userFileRepository.delete(file);
    }
}
