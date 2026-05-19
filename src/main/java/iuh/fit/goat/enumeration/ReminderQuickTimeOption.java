package iuh.fit.goat.enumeration;

public enum ReminderQuickTimeOption {
    IN_15_MINUTES("In 15 minutes"), IN_30_MINUTES("In 30 minutes"),
    TOMORROW("Tomorrow"), CUSTOM("Custom");

    private final String value;

    ReminderQuickTimeOption(String value) {
        this.value = value;
    }
}

