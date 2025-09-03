package pl.maciekT.jezyki.backend.common;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    private record ErrorBody(Instant timestamp, int status, String error, String message, String path,
                             Map<String, String> validation) {}

    @org.springframework.web.bind.annotation.ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorBody> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, String> validation = new HashMap<>();
        for (var e : ex.getBindingResult().getAllErrors()) {
            if (e instanceof FieldError fe) validation.put(fe.getField(), fe.getDefaultMessage());
        }
        var body = new ErrorBody(Instant.now(), HttpStatus.BAD_REQUEST.value(), "Bad Request",
                "Validation failed", req.getRequestURI(), validation);
        return ResponseEntity.badRequest().body(body);
    }

    @org.springframework.web.bind.annotation.ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorBody> handleRse(ResponseStatusException ex, HttpServletRequest req) {
        var status = ex.getStatusCode();
        var body = new ErrorBody(Instant.now(), status.value(), status.toString(),
                ex.getReason(), req.getRequestURI(), null);
        return ResponseEntity.status(status).body(body);
    }

    @org.springframework.web.bind.annotation.ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorBody> handleOther(Exception ex, HttpServletRequest req) {
        var status = HttpStatus.INTERNAL_SERVER_ERROR;
        var body = new ErrorBody(Instant.now(), status.value(), status.toString(),
                ex.getMessage(), req.getRequestURI(), null);
        return ResponseEntity.status(status).body(body);
    }
}
