package iuh.fit.goat.service.impl;

import iuh.fit.goat.entity.Job;
import iuh.fit.goat.entity.Reminder;
import iuh.fit.goat.repository.JobRepository;
import iuh.fit.goat.repository.ReminderRepository;
import iuh.fit.goat.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduledServiceImpl implements ScheduledService {
    private final AiService aiService;
    private final SubscriberService subscriberService;
    private final CompanyAwardService companyAwardService;
    private final ReminderService reminderService;

    private final ReminderRepository reminderRepository;
    private final JobRepository jobRepository;

    @Qualifier("reminderExecutor")
    private final Executor executor;

    @Override
//    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void handleDeactivateExpiredJobs() {
        LocalDate today = LocalDate.now();
        List<Job> jobs = this.jobRepository.findAll();

        jobs.forEach(job -> {
            if(job.getEndDate() != null && job.getEndDate().isBefore(today)){
                job.setActive(false);
            }
        });

        this.jobRepository.saveAll(jobs);

    }

    @Override
//    @Scheduled(cron = "0 0 */12 * * *")
    @Transactional
    public void handleSendSuitableJobs(){
        this.subscriberService.handleSendSubscribersEmailJobs();
        this.subscriberService.handleSendFollowersEmailJobs();
    }

    @Override
//    @Scheduled(cron = "0 */15 * * * *")
    @Transactional
    public void handleRefreshAiCache() {
        this.aiService.getTopJobsContext();
        this.aiService.getTopApplicantsContext();
        this.aiService.getTopCompaniesContext();
        this.aiService.getRecentApplicationsContext();
        this.aiService.getTopSkillsContext();
        this.aiService.getRecentBlogsContext();
        this.aiService.getAllCareersContext();
        this.aiService.getSystemStatsContext();
        this.aiService.getJobMarketOverview();

        log.info("AI cache refreshed!");
    }

    @Override
    @Scheduled(cron = "0 0 1 1 * *")
    @Transactional
    public void calculateLastYearAwards() {
        int year = Year.now().minusYears(1).getValue();
        this.companyAwardService.calculateAwardsForYear(year);

        log.info("Calculated company awards for year: " + year);
    }

    @Override
    @Scheduled(fixedDelay = 5000)
    public void dispatchDueReminders() {
        Instant now = Instant.now();
        List<Reminder> dueReminders = this.reminderRepository.findDueReminders(now);

        if(dueReminders.isEmpty()) return;

        List<CompletableFuture<Void>> futures = dueReminders.stream()
                .map(reminder -> CompletableFuture.runAsync(
                        () -> {
                            try {
                                this.reminderService.processReminderDispatch(reminder);
                            } catch (Exception ex) {
                                log.error("Failed to dispatch reminder {}: {}", reminder.getReminderId(), ex.getMessage(), ex);
                            }
                        },
                        executor
                ))
                .toList();

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
    }
}
