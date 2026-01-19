// Frontend validation constants
export const VALIDATION = {
  // File validation
  FILE_SIZES: {
    IMAGE: 5 * 1024 * 1024, // 5MB
    DOCUMENT: 10 * 1024 * 1024, // 10MB
  },
  FILE_TYPES: {
    IMAGES: ["image/jpeg", "image/png", "image/jpg"],
    DOCUMENTS: ["application/pdf", "application/msword"],
  },

  // String validation
  STRINGS: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 255,
    NICKNAME_MIN: 2,
    NICKNAME_MAX: 50,
    DESCRIPTION_MAX: 1000,
  },

  // Numbers validation
  NUMBERS: {
    EVENT_CAPACITY_MIN: 1,
    EVENT_CAPACITY_MAX: 10000,
    POINTS_MIN: 0,
    POINTS_MAX: 999999,
  },

  // Pagination
  PAGINATION: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    DEFAULT_PAGE: 1,
  },
} as const;

// Message templates
export const MESSAGES = {
  ERRORS: {
    FILE_TOO_LARGE: "File size must be less than 5MB",
    INVALID_FILE_TYPE: "Only JPG, JPEG, PNG files are allowed",
    INVALID_EMAIL: "Please enter a valid email",
    INVALID_PHONE: "Please enter a valid phone number",
  },
  SUCCESS: {
    PROFILE_UPDATED: "Profile updated successfully!",
    EVENT_CREATED: "Event created successfully!",
    APPLICATION_SUBMITTED: "Application submitted successfully!",
  },
} as const;
