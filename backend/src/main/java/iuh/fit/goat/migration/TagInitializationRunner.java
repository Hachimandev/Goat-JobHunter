package iuh.fit.goat.migration;

import iuh.fit.goat.entity.Tag;
import iuh.fit.goat.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Order(2)
@Slf4j
@RequiredArgsConstructor
public class TagInitializationRunner implements CommandLineRunner {

    private static final String SYSTEM_TAG_NAME = "Người lạ";
    private static final String SYSTEM_TAG_COLOR = "#9E9E9E";

    private final TagRepository tagRepository;

    @Override
    @Transactional
    public void run(String... args) {
        ensureSystemTagExists();
    }

    private void ensureSystemTagExists() {
        if (this.tagRepository.findByNameIgnoreCaseAndSystemTagIsTrue(SYSTEM_TAG_NAME).isPresent()) {
            log.info("System tag '{}' already exists", SYSTEM_TAG_NAME);
            return;
        }

        Tag tag = new Tag();
        tag.setName(SYSTEM_TAG_NAME);
        tag.setColor(SYSTEM_TAG_COLOR);
        tag.setSystemTag(true);

        try {
            this.tagRepository.save(tag);
            log.info("Created default system tag '{}'", SYSTEM_TAG_NAME);
        } catch (DataIntegrityViolationException ex) {
            log.warn("System tag '{}' was created concurrently", SYSTEM_TAG_NAME);
        }
    }
}

