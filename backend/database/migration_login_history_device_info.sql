USE sistem_kebencanaan;

ALTER TABLE login_history
  CHANGE COLUMN user_agent device_info VARCHAR(255) NULL DEFAULT NULL;