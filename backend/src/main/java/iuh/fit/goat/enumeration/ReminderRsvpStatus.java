package iuh.fit.goat.enumeration;

public enum ReminderRsvpStatus {
    PENDING("Pending"), ACCEPTED("Accepted"), REJECTED("Rejected");

    private final String value;

    ReminderRsvpStatus(String value) {
        this.value = value;
    }
}

