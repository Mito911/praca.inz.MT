package pl.maciekT.jezyki.backend.language;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = LanguageController.class)
@AutoConfigureMockMvc(addFilters = false) // wyłączamy filtry Security na czas testu MVC
class LanguageControllerTest {

    @Autowired
    MockMvc mvc;

    @MockBean
    LanguageRepository repo;

    @Test
    void list_all() throws Exception {
        var l1 = new Language(); l1.setId(1L); l1.setCode("en"); l1.setName("English");
        var l2 = new Language(); l2.setId(2L); l2.setCode("pl"); l2.setName("Polski");
        when(repo.findAll()).thenReturn(List.of(l1, l2));

        mvc.perform(get("/api/languages"))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$[0].id").value(1))
           .andExpect(jsonPath("$[0].code").value("en"))
           .andExpect(jsonPath("$[0].name").value("English"))
           .andExpect(jsonPath("$[1].id").value(2))
           .andExpect(jsonPath("$[1].code").value("pl"));
    }

    @Test
    void create_ok() throws Exception {
        when(repo.existsByCodeIgnoreCase("en")).thenReturn(false);
        when(repo.save(ArgumentMatchers.any(Language.class)))
            .thenAnswer(inv -> { Language l = inv.getArgument(0); l.setId(10L); return l; });

        mvc.perform(post("/api/languages")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"code\":\"en\",\"name\":\"English\"}"))
           .andExpect(status().isCreated())
           .andExpect(jsonPath("$.id").value(10))
           .andExpect(jsonPath("$.code").value("en"))
           .andExpect(jsonPath("$.name").value("English"));
    }

    @Test
    void create_conflict_when_code_exists() throws Exception {
        when(repo.existsByCodeIgnoreCase("en")).thenReturn(true);

        mvc.perform(post("/api/languages")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"code\":\"en\",\"name\":\"English\"}"))
           .andExpect(status().isConflict());
    }

    @Test
    void update_ok() throws Exception {
        var existing = new Language(); existing.setId(1L); existing.setCode("pl"); existing.setName("Polski");
        when(repo.findById(1L)).thenReturn(Optional.of(existing));
        when(repo.existsByCodeIgnoreCase("en")).thenReturn(false);
        when(repo.save(ArgumentMatchers.any(Language.class)))
            .thenAnswer(inv -> inv.getArgument(0));

        mvc.perform(put("/api/languages/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"code\":\"en\",\"name\":\"English\"}"))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.id").value(1))
           .andExpect(jsonPath("$.code").value("en"))
           .andExpect(jsonPath("$.name").value("English"));
    }

    @Test
    void delete_noContent() throws Exception {
        when(repo.existsById(1L)).thenReturn(true);

        mvc.perform(delete("/api/languages/1"))
           .andExpect(status().isNoContent());

        verify(repo).deleteById(1L);
    }
}
