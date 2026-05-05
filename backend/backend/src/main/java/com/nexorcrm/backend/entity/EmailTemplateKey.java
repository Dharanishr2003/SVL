package com.nexorcrm.backend.entity;

import java.util.Locale;

public enum EmailTemplateKey {
    OFFER_LETTER_TEMPLATE("Offer Letter Template"),
    PROFILE_COMPLETION_TEMPLATE("Profile Completion Template");

    private final String label;

    EmailTemplateKey(String label) {
        this.label = label;
    }

    public String getKey() {
        return name();
    }

    public String getLabel() {
        return label;
    }

    public static EmailTemplateKey fromKey(String key) {
        if (key == null) return null;
        try {
            return EmailTemplateKey.valueOf(key.trim().toUpperCase(Locale.ROOT));
        } catch (Exception ex) {
            return null;
        }
    }
}
