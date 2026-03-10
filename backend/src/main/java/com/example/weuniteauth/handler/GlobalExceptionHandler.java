package com.example.weuniteauth.handler;

import com.example.weuniteauth.exceptions.BusinessRuleException;
import com.example.weuniteauth.exceptions.DuplicateResourceException;
import com.example.weuniteauth.exceptions.NotFoundResourceException;
import com.example.weuniteauth.exceptions.UnauthorizedException;
import com.example.weuniteauth.exceptions.mail.EmailSendingException;
import com.example.weuniteauth.exceptions.mail.LoadingEmailTemplateException;
import com.example.weuniteauth.response.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    private final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception ex) {
        logger.error(ex.getMessage(), ex);
        ErrorResponse response = new ErrorResponse(ex.getMessage(), "INTERNAL_SERVER_ERROR");
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(NotFoundResourceException.class)
    public ResponseEntity<ErrorResponse> handleNotFoundResourceException(NotFoundResourceException ex) {
        logger.error(ex.getMessage(), ex.getError());
        ErrorResponse response = new ErrorResponse(ex.getMessage(), ex.getError());
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateResourceException(DuplicateResourceException ex) {
        logger.error(ex.getMessage(), ex.getError());
        ErrorResponse response = new ErrorResponse(ex.getMessage(), ex.getError());
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<ErrorResponse> handleBusinessRuleException(BusinessRuleException ex) {
        logger.error(ex.getMessage(), ex.getError());
        ErrorResponse response = new ErrorResponse(ex.getMessage(), ex.getError());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(EmailSendingException.class)
    public ResponseEntity<ErrorResponse> handleEmailSendingException(EmailSendingException ex) {
        logger.error(ex.getMessage(), ex.getCause());
        ErrorResponse response = new ErrorResponse(ex.getMessage(), ex.getError());
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(LoadingEmailTemplateException.class)
    public ResponseEntity<ErrorResponse> handleLoadingEmailTemplateException(LoadingEmailTemplateException ex) {
        logger.error(ex.getMessage(), ex.getCause());
        ErrorResponse response = new ErrorResponse(ex.getMessage(), ex.getError());
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Object> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorizedException(UnauthorizedException ex) {
        logger.error(ex.getMessage(), ex.getError());
        ErrorResponse response = new ErrorResponse(ex.getMessage(), ex.getError());
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

}
