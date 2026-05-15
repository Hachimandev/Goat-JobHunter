package iuh.fit.goat.enumeration;

public enum ReminderRepeatType {
    NONE("none"), DAILY("daily"), WEEKLY("weekly"),
    MONTHLY("monthly"), YEARLY("yearly");

    private final String value;

    ReminderRepeatType(String value) {
        this.value = value;
    }
}

