import { useState } from "react";
import { Card, Section } from "../../../libs/shared/ui";
import { useScrollToTop } from "../../hooks/useScrollToTop";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../libs/components/ui/tabs";
import {
  ChevronDown,
  Search,
  HelpCircle,
  Plus,
  Minus,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string | string[];
}

interface FAQSection {
  title: string;
  items: FAQItem[];
}

const volunteerFAQs: FAQSection[] = [
  {
    title: "Getting Started",
    items: [
      {
        question: "How do I create an account?",
        answer: [
          "1. Click 'Sign Up' in the top right corner",
          "2. Fill in your details (name, email, password)",
          "3. Choose 'Volunteer' as your account type",
          "4. Complete your profile with a profile picture (or get a unique default avatar automatically)",
          "5. Start exploring events!",
        ],
      },
      {
        question: "How do I find events to join?",
        answer:
          "Browse events from the 'Events' page in the navigation menu. You can filter by category, location, and date. Check out 'Popular Events' and 'Trending Events' on the homepage for featured opportunities.",
      },
      {
        question: "What does my profile picture show if I don't upload one?",
        answer:
          "If you don't upload a profile picture, Unity automatically generates a unique, colorful avatar based on your name using Dicebear. You can always upload your own photo later in Settings.",
      },
    ],
  },
  {
    title: "Applying to Events",
    items: [
      {
        question: "How do I apply to volunteer for an event?",
        answer:
          "Go to the event detail page and click the 'Apply to Join' button. The organizer will review your application and approve or reject it. You'll see your application status in your profile.",
      },
      {
        question: "What do the different application statuses mean?",
        answer: [
          "• PENDING: Your application is waiting for organizer review",
          "• APPROVED: Congratulations! The organizer accepted you",
          "• REJECTED: The organizer declined your application",
          "• COMPLETED: The event is finished and the organizer marked your participation as complete",
          "• CANCELED: You or the organizer canceled the application",
        ],
      },
      {
        question: "Can I apply to an event that's already completed?",
        answer:
          "No, the 'Apply to Join' button is automatically disabled for completed events. You also can't reapply if your application was rejected or already completed.",
      },
      {
        question: "How do I cancel my application?",
        answer:
          "Visit your profile and navigate to 'My Applications'. Find the event and click the cancel button if the event hasn't started yet.",
      },
    ],
  },
  {
    title: "Managing Your Profile",
    items: [
      {
        question: "How do I view my volunteer history?",
        answer:
          "Go to your profile page to see all your applications organized by status: Pending, Approved, Rejected, and Completed. Your completed events showcase your volunteer experience!",
      },
      {
        question: "How do I update my profile information?",
        answer:
          "Click on your profile icon in the top right, go to 'Settings', and update your name, bio, profile picture, or other details. Changes are saved immediately.",
      },
      {
        question: "Can I follow organizers?",
        answer:
          "Yes! Visit an organizer's profile and click the 'Follow' button to get updates about their new events and activities.",
      },
      {
        question: "What are the different event categories?",
        answer:
          "Unity offers various event categories including Community Service, Environmental, Education, Healthcare, Animal Welfare, Arts & Culture, Sports & Recreation, and more. Filter by category to find events that match your interests.",
      },
      {
        question: "Can I see events I've liked or commented on?",
        answer:
          "Yes! Your interactions are saved and you can view them in your profile. Liked events help you keep track of opportunities you're interested in.",
      },
    ],
  },
];

const organizerFAQs: FAQSection[] = [
  {
    title: "Getting Started as an Organizer",
    items: [
      {
        question: "How do I become an organizer?",
        answer: [
          "1. Create an account or login",
          "2. Click 'Sign Up' and select 'Organizer' as account type",
          "3. Complete your organizer profile with details about your organization",
          "4. Start creating events to recruit volunteers!",
        ],
      },
      {
        question: "What can I do as an organizer?",
        answer:
          "Organizers can create events, manage volunteer applications, communicate with volunteers, track attendance, and build their reputation in the Unity community.",
      },
    ],
  },
  {
    title: "Creating & Managing Events",
    items: [
      {
        question: "How do I create an event?",
        answer: [
          "1. Go to your Organizer Dashboard",
          "2. Click 'Create Event'",
          "3. Fill in event details: title, description, date, location, category",
          "4. Upload an event cover image",
          "5. Set the number of volunteers needed",
          "6. Publish your event!",
        ],
      },
      {
        question: "How do I edit or update an event?",
        answer:
          "From your dashboard, find the event and click 'Edit'. You can update any details except past dates. Make sure to save changes before leaving the page.",
      },
      {
        question: "What are event statuses?",
        answer: [
          "• ACTIVE: Event is live and accepting applications",
          "• COMPLETED: Event has finished successfully",
          "• CANCELED: Event was canceled and won't take place",
          "• DELETE: Event is marked for deletion (soft delete)",
        ],
      },
      {
        question: "How do I mark an event as completed?",
        answer:
          "After your event finishes, go to your dashboard, find the event, and change its status to 'Completed'. This helps maintain accurate records and volunteer histories.",
      },
    ],
  },
  {
    title: "Managing Volunteer Applications",
    items: [
      {
        question: "How do I see who applied to my event?",
        answer:
          "Click on an event in your dashboard, then click 'Manage Applicants' or 'View Attendees'. You'll see all applications organized by status: Pending, Approved, Rejected, and Completed.",
      },
      {
        question: "How do I approve or reject applications?",
        answer:
          "In the 'Manage Applicants' modal, review volunteer profiles in the 'Pending' tab. Click 'Approve' to accept them or 'Reject' to decline. Approved volunteers can see they've been accepted.",
      },
      {
        question: "How do I mark a volunteer's participation as complete?",
        answer:
          "After the event ends, open 'Manage Applicants', go to the 'Approved' tab, and click the 'Complete' button next to volunteers who attended. This adds the event to their volunteer history as 'Completed'.",
      },
      {
        question: "Can I undo an approval or rejection?",
        answer:
          "Currently, you cannot change a status once set. Make sure to review applications carefully before approving or rejecting them.",
      },
    ],
  },
  {
    title: "Organizer Dashboard",
    items: [
      {
        question: "What can I see in my dashboard?",
        answer:
          "Your dashboard shows all your events, upcoming activities, application statistics, and quick actions to manage events and volunteers. It's your central hub for organizing.",
      },
      {
        question: "How do I track my event performance?",
        answer:
          "Each event card shows the number of applications, approved volunteers, and total capacity. You can see which events are most popular and adjust accordingly.",
      },
      {
        question: "Can I cancel an event after creating it?",
        answer:
          "Yes, you can change the event status to 'CANCELED' from your dashboard. It's recommended to notify approved volunteers before canceling an event.",
      },
      {
        question: "How do I get more volunteers for my event?",
        answer:
          "Create detailed, engaging event descriptions with clear images. Popular events with more applications appear in the 'Trending' section on the homepage, giving you more visibility. Respond to comments and engage with the community.",
      },
      {
        question: "Can I edit an event after volunteers have applied?",
        answer:
          "Yes, but be careful with major changes like date or location. Consider notifying approved volunteers through comments or other communication methods if you make significant changes.",
      },
    ],
  },
];

const groupFAQs: FAQSection[] = [
  {
    title: "About Groups",
    items: [
      {
        question: "What are groups in Unity?",
        answer:
          "Groups are communities where volunteers and organizers can connect, share updates, discuss topics, and build networks around common interests or causes.",
      },
      {
        question: "How do I join a group?",
        answer:
          "Browse available groups from the 'Groups' page in the navigation menu. Click on a group to view details and click 'Join' to become a member.",
      },
      {
        question: "Can I create my own group?",
        answer:
          "Yes! Groups can be created by both volunteers and organizers. Look for the 'Create Group' button on the Groups page to start your own community.",
      },
    ],
  },
  {
    title: "Engaging in Groups",
    items: [
      {
        question: "Are there private or public groups?",
        answer:
          "Groups can be set as public (anyone can join) or private (require approval). Check the group settings when creating or viewing a group to understand its privacy level.",
      },
      {
        question: "Can I be an admin of a group?",
        answer:
          "Yes, when you create a group you become the admin. Group admins can manage members, moderate posts, and configure group settings.",
      },
      {
        question: "How do I post in a group?",
        answer:
          "Once you're a member, visit the group page and look for the post creation area. Share updates, ask questions, or start discussions with other members.",
      },
      {
        question: "Can I leave a group?",
        answer:
          "Yes, you can leave any group at any time by visiting the group page and clicking 'Leave Group'. Your previous posts will remain visible.",
      },
      {
        question: "How do I interact with group posts?",
        answer:
          "You can like posts, comment on them, and reply to other members' comments. Engage respectfully to build a positive community!",
      },
    ],
  },
];

const generalFAQs: FAQSection[] = [
  {
    title: "Features & Navigation",
    items: [
      {
        question: "How do I search for events or organizers?",
        answer:
          "Use the search bar and filters on the Events or Organizers pages. You can filter by category, location, date range, and other criteria to find exactly what you're looking for.",
      },
      {
        question: "How do notifications work?",
        answer:
          "You'll receive notifications when organizers respond to your applications, when someone interacts with your posts, or when organizers you follow create new events.",
      },
      {
        question: "Can I filter events by date?",
        answer:
          "Yes! Use the date filters on the Events page to find opportunities in specific time ranges. You can search for events happening today, this week, this month, or set custom date ranges.",
      },
      {
        question: "How do I share an event with others?",
        answer:
          "You can copy the event page URL from your browser and share it with friends. They can view the event details and apply even without an account (though they'll need to create one to apply).",
      },
      {
        question: "What happens to my data when I delete my account?",
        answer:
          "When you delete your account, all your personal information, applications, and profile data are permanently removed. Your past comments on events may remain for community context, but without your personal information.",
      },
      {
        question: "Can I like and comment on events?",
        answer:
          "Yes! Event pages have like buttons and comment sections. Share your thoughts, ask questions, or express interest. Organizers can see and respond to comments.",
      },
      {
        question: "How does the 'Popular Events' section work?",
        answer:
          "Popular Events are determined by the number of applications, likes, comments, and views. Only upcoming events are shown - past events are automatically filtered out.",
      },
    ],
  },
  {
    title: "Account & Settings",
    items: [
      {
        question: "How do I change my password?",
        answer:
          "Go to Settings from your profile menu and look for the 'Change Password' section. Enter your current password and new password to update it.",
      },
      {
        question: "Can I switch between volunteer and organizer accounts?",
        answer:
          "Currently, you need separate accounts for volunteer and organizer roles. This helps maintain clear distinctions and appropriate features for each role.",
      },
      {
        question: "How do I update my email address?",
        answer:
          "Contact support to change your email address, as this affects your login credentials and requires verification for security.",
      },
      {
        question: "Is my information private?",
        answer:
          "Your email and contact details are private. Only information you choose to display on your public profile (name, bio, profile picture) is visible to other users.",
      },
    ],
  },
];

const troubleshootingFAQs: FAQSection[] = [
  {
    title: "Common Issues",
    items: [
      {
        question: "Events or data are not loading. What should I do?",
        answer:
          "First, make sure the backend server is running. Refresh the page and check your internet connection. If the problem persists, try clearing your browser cache or contact support.",
      },
      {
        question: "I can't upload images. What's wrong?",
        answer:
          "Check that your image file is in a supported format (JPG, PNG, GIF) and under the maximum file size. Make sure you have a stable internet connection during upload.",
      },
      {
        question: "The page doesn't scroll to the top when I navigate.",
        answer:
          "This should happen automatically on all pages. If not, try refreshing the page. This feature was recently implemented across the entire application.",
      },
      {
        question: "My profile picture appears broken or missing.",
        answer:
          "If you haven't uploaded a picture, Unity automatically generates a unique avatar for you. If you uploaded a picture and it's not showing, try uploading again or contact support.",
      },
      {
        question: "The 'Apply to Join' button is disabled. Why?",
        answer: [
          "The button is disabled in these cases:",
          "• The event has already completed",
          "• You've already applied (check application status)",
          "• Your application was rejected or completed",
          "• You need to log in first",
        ],
      },
    ],
  },
  {
    title: "Technical Support",
    items: [
      {
        question: "Which browsers are supported?",
        answer:
          "Unity works best on modern browsers: Chrome, Firefox, Safari, and Edge (latest versions). Make sure JavaScript is enabled and cookies are allowed.",
      },
      {
        question: "Is Unity mobile-friendly?",
        answer:
          "Yes! Unity is designed to work on all devices - desktop, tablet, and mobile. The interface adapts to your screen size for the best experience.",
      },
      {
        question: "How do I report a bug or issue?",
        answer:
          "Please contact the development team through the support channel or create an issue in the project repository with detailed steps to reproduce the problem.",
      },
    ],
  },
  {
    title: "Account Issues",
    items: [
      {
        question: "I forgot my password. How do I reset it?",
        answer:
          "Click 'Forgot Password' on the login page and enter your email. You'll receive instructions to reset your password. Check your spam folder if you don't see the email.",
      },
      {
        question: "How do I delete my account?",
        answer:
          "Go to Settings and look for 'Delete Account' at the bottom of the page. This action is permanent and cannot be undone. All your data will be removed.",
      },
      {
        question: "I'm not receiving email notifications.",
        answer:
          "Check your spam folder and notification settings. Make sure the email address in your account is correct and notifications are enabled in your preferences.",
      },
    ],
  },
];

function FAQAccordion({ section }: { section: FAQSection }) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    const newOpen = new Set(openItems);
    if (newOpen.has(index)) {
      newOpen.delete(index);
    } else {
      newOpen.add(index);
    }
    setOpenItems(newOpen);
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold mb-3 text-foreground flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-primary" />
        {section.title}
      </h3>
      <div className="flex flex-col gap-3">
        {section.items.map((item, index) => {
          const isOpen = openItems.has(index);
          const isHovered = hoveredIndex === index;
          return (
            <div
              key={index}
              className={`
                rounded-lg transition-all duration-200 overflow-hidden
                ${
                  isOpen
                    ? "bg-primary/5 border-2 border-primary shadow-lg"
                    : isHovered
                      ? "bg-card border-2 border-muted-foreground/30 shadow-md"
                      : "bg-card border border-border shadow-sm"
                }
              `}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full p-4 flex items-start gap-3 text-left hover:bg-muted/30 transition-colors"
              >
                {/* Large Icon Indicator */}
                <div
                  className={`
                    flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200
                    ${
                      isOpen
                        ? "bg-primary text-white shadow-md"
                        : "bg-muted text-muted-foreground"
                    }
                  `}
                >
                  {isOpen ? (
                    <Minus className="h-5 w-5" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                </div>

                {/* Question Text */}
                <div className="flex-1">
                  <div
                    className={`
                      text-[15px] font-semibold leading-snug transition-colors
                      ${isOpen ? "text-primary" : "text-foreground"}
                    `}
                  >
                    {item.question}
                  </div>
                </div>

                {/* Arrow Indicator */}
                <div className="flex-shrink-0 transition-transform duration-200">
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Answer Content */}
              {isOpen && (
                <div className="px-4 pb-4 pl-[60px]">
                  <div className="border-t border-border pt-3">
                    <div className="text-sm text-muted-foreground leading-relaxed">
                      {Array.isArray(item.answer) ? (
                        <div className="flex flex-col gap-2">
                          {item.answer.map((line, i) => (
                            <div key={i}>{line}</div>
                          ))}
                        </div>
                      ) : (
                        item.answer
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function HelpPage() {
  useScrollToTop();
  const [activeTab, setActiveTab] = useState("volunteers");
  const [searchQuery, setSearchQuery] = useState("");

  // Add CSS animation
  const style = document.createElement("style");
  style.textContent = `
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  if (!document.querySelector("style[data-help-animations]")) {
    style.setAttribute("data-help-animations", "true");
    document.head.appendChild(style);
  }

  const filterFAQs = (sections: FAQSection[]): FAQSection[] => {
    if (!searchQuery.trim()) return sections;

    const query = searchQuery.toLowerCase();
    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.question.toLowerCase().includes(query) ||
            (Array.isArray(item.answer)
              ? item.answer.some((a) => a.toLowerCase().includes(query))
              : item.answer.toLowerCase().includes(query)),
        ),
      }))
      .filter((section) => section.items.length > 0);
  };

  const getCurrentFAQs = (): FAQSection[] => {
    let faqs: FAQSection[] = [];
    switch (activeTab) {
      case "volunteers":
        faqs = volunteerFAQs;
        break;
      case "organizers":
        faqs = organizerFAQs;
        break;
      case "groups":
        faqs = groupFAQs;
        break;
      case "general":
        faqs = generalFAQs;
        break;
      case "troubleshooting":
        faqs = troubleshootingFAQs;
        break;
      default:
        faqs = volunteerFAQs;
    }
    return filterFAQs(faqs);
  };

  const filteredFAQs = getCurrentFAQs();

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <Section
        title="Help Center"
        description="Find answers to common questions and learn how to use Unity."
      >
        {/* Search Bar */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Search
              size={20}
              style={{
                position: "absolute",
                left: 16,
                color: "var(--text-muted)",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder="Search help topics, questions, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 16px 14px 48px",
                fontSize: 15,
                border: "2px solid var(--border-color)",
                borderRadius: "var(--radius-lg)",
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                outline: "none",
                transition: "all 0.2s ease",
                boxShadow: "var(--shadow)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--primary-color)";
                e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border-color)";
                e.target.style.boxShadow = "var(--shadow)";
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: 16,
                  background: "var(--text-muted)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: "bold",
                }}
              >
                ✕
              </button>
            )}
          </div>
          {searchQuery && (
            <div
              style={{ marginTop: 8, fontSize: 13, color: "var(--text-muted)" }}
            >
              Searching across{" "}
              {activeTab === "volunteers"
                ? "Volunteer"
                : activeTab === "organizers"
                  ? "Organizer"
                  : activeTab === "groups"
                    ? "Group"
                    : activeTab === "general"
                      ? "General"
                      : "Troubleshooting"}{" "}
              topics...
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
            <TabsTrigger value="organizers">Organizers</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="troubleshooting">Help</TabsTrigger>
          </TabsList>

          <TabsContent value="volunteers">
            {filteredFAQs.length > 0 ? (
              <>

                {filteredFAQs.map((section, index) => (
                  <FAQAccordion key={index} section={section} />
                ))}
              </>
            ) : (
              <Card>
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px 0",
                    color: "var(--text-muted)",
                  }}
                >
                  No results found for "{searchQuery}". Try different keywords.
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="organizers">
            {filteredFAQs.length > 0 ? (
              <>
                {filteredFAQs.map((section, index) => (
                  <FAQAccordion key={index} section={section} />
                ))}
              </>
            ) : (
              <Card>
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px 0",
                    color: "var(--text-muted)",
                  }}
                >
                  No results found for "{searchQuery}". Try different keywords.
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="groups">
            {filteredFAQs.length > 0 ? (
              <>
                {filteredFAQs.map((section, index) => (
                  <FAQAccordion key={index} section={section} />
                ))}
              </>
            ) : (
              <Card>
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px 0",
                    color: "var(--text-muted)",
                  }}
                >
                  No results found for "{searchQuery}". Try different keywords.
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="general">
            {filteredFAQs.length > 0 ? (
              <>
                {filteredFAQs.map((section, index) => (
                  <FAQAccordion key={index} section={section} />
                ))}
              </>
            ) : (
              <Card>
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px 0",
                    color: "var(--text-muted)",
                  }}
                >
                  No results found for "{searchQuery}". Try different keywords.
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="troubleshooting">
            {filteredFAQs.length > 0 ? (
              <>
                {filteredFAQs.map((section, index) => (
                  <FAQAccordion key={index} section={section} />
                ))}
              </>
            ) : (
              <Card>
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px 0",
                    color: "var(--text-muted)",
                  }}
                >
                  No results found for "{searchQuery}". Try different keywords.
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Contact Support Section */}
        <Card>
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
              Still need help?
            </h4>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: 14,
                marginBottom: 16,
              }}
            >
              Can't find what you're looking for? Contact our support team.
            </p>
            <button
              style={{
                padding: "10px 24px",
                background: "var(--primary)",
                border: "1px solid var(--primary)",
                borderRadius: "calc(var(--radius) - 2px)",
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Contact Support
            </button>
          </div>
        </Card>
      </Section>
    </div>
  );
}
