document.getElementById("year").textContent = new Date().getFullYear();

// --- 1. Dynamic Team & Mentor Rendering ---

// UPDATED: Changed path to use the root-relative path to the assets directory
const SETTINGS_FILE = "/assets/settings.json";

// Define social media details for dynamic generation and conditional rendering
const SOCIAL_CONFIG = {
  GitHub: { url: "https://github.com/", icon: "fab fa-github" },
  instagram: { url: "https://instagram.com/", icon: "fab fa-instagram" },
  facebook: { url: "https://www.facebook.com/", icon: "fab fa-facebook-f" },
  linkedin: { url: "https://www.linkedin.com/in/", icon: "fab fa-linkedin-in" },
  medium: { url: "https://medium.com/@", icon: "fab fa-medium-m" },
};

/**
 * Creates an HTML card for a person.
 * @param {object} person - The person object from settings.json.
 * @param {string} type - 'member', 'contributor', or 'mentor'.
 * @returns {string} The HTML string for the card.
 */
function createPersonCard(person, type) {
  // Generate a unique image placeholder URL based on name or type
  const nameSlug = person.name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const mockImage = `https://placehold.co/112x112/374151/ffffff?text=${person.name
    .split(" ")
    .map((n) => n[0])
    .join("")}`;

  // Combine all positions into a single string
  const positions =
    person.position.length > 0
      ? person.position.join(" • ")
      : type === "mentor"
      ? "Advisor"
      : "Core Team";

  // Use a placeholder if no image is defined
  const imageUrl = person.attributes?.image || mockImage;

  // Social links generation
  let socialLinksHTML = "";
  const socials = person.socials || {};

  for (const platform in SOCIAL_CONFIG) {
    const username = socials[platform];
    // Check if the username exists and is not an empty string/null
    if (username && String(username).trim() !== "") {
      const config = SOCIAL_CONFIG[platform];
      let linkUrl = "";

      // Construct the final URL based on the platform
      switch (platform) {
        case "medium":
          // Ensures the correct medium profile URL format
          linkUrl = `https://medium.com/@${username}`;
          break;
        case "linkedin":
          // Ensures the correct linkedin /in/ format
          linkUrl = `https://www.linkedin.com/in/${username}`;
          break;
        default:
          linkUrl = config.url + username;
      }

      socialLinksHTML += `
                <a href="${linkUrl}" target="_blank" class="text-gray-500 hover:text-indigo-600 transition">
                    <i class="${config.icon} text-lg"></i>
                </a>
            `;
    }
  }

  // Wrap social links in a div for layout if any links were generated
  let socialLinksWrapper = "";
  if (socialLinksHTML) {
    socialLinksWrapper = `<div class="flex justify-center gap-4 mt-3">${socialLinksHTML}</div>`;
  }

  return `
        <div class="p-6 bg-white rounded-2xl shadow-md text-center member-card">
            <img src="${imageUrl}" onerror="this.onerror=null;this.src='${mockImage}'" alt="${person.name}" class="mx-auto rounded-full w-28 h-28 object-cover shadow-sm mb-4">
            <h4 class="mt-4 font-semibold">${person.name}</h4>
            <div class="text-sm text-gray-500">${positions}</div>
            ${socialLinksWrapper}
        </div>
    `;
}

/**
 * Renders a group of people into a container, with nx3 structure and center alignment.
 * @param {HTMLElement} container - The target DOM element.
 * @param {Array} people - Array of person objects.
 * @param {string} title - Title for the section.
 * @param {string} type - Type of people ('member', 'contributor', 'mentor').
 */
function renderPeopleGroup(container, people, title, type) {
  if (people && people.length > 0 && container) {
    const numPeople = people.length;

    let contentHTML;

    // Conditional layout for centering 1 or 2 items (for aesthetic balance in the last row)
    if (numPeople <= 2) {
      contentHTML = `
                <div class="flex flex-wrap justify-center gap-6">
                    ${people
                      .map(
                        (person) =>
                          // Each item uses max-w-xs to constrain its width, helping centering
                          `<div class="max-w-xs sm:w-1/2 lg:w-1/3">${createPersonCard(
                            person,
                            type
                          )}</div>`
                      )
                      .join("")}
                </div>
            `;
    } else {
      // Use standard grid for 3 or more items (nx3 structure)
      contentHTML = `
                <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${people
                      .map((person) => createPersonCard(person, type))
                      .join("")}
                </div>
            `;
    }

    container.innerHTML = `
            <div class="mt-12">
                <h3 class="text-2xl font-bold mb-6 text-center">${title}</h3>
                ${contentHTML}
            </div>
        `;
  }
}

/**
 * Fetches settings.json and renders team/contributor/mentor sections.
 */
async function loadTeamData() {
  try {
    const response = await fetch(SETTINGS_FILE);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Settings file not found (404).");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // Target containers
    const teamContainer = document.getElementById("team-members");
    const contributorContainer = document.getElementById("contributors");
    const mentorContainer = document.getElementById("mentors");

    // Render sections
    renderPeopleGroup(
      teamContainer,
      data.members,
      "Core Research Team",
      "member"
    );
    renderPeopleGroup(
      contributorContainer,
      data.contributors,
      "External Contributors",
      "contributor"
    );
    renderPeopleGroup(
      mentorContainer,
      data.mentors,
      "Guiding Mentors & Advisors",
      "mentor"
    );
  } catch (error) {
    console.error("Could not load or parse settings.json:", error);
    // Fallback message
    const teamSection = document.getElementById("team");
    if (teamSection) {
      // The team/mentor/contributor divs are inside the #team section
      teamSection.innerHTML += `<div class="mt-8 text-center p-8 bg-red-100 text-red-700 rounded-lg max-w-xl mx-auto">
                <i class="fas fa-exclamation-triangle mr-2"></i> Error loading team data. Please ensure 'settings.json' is accessible.
            </div>`;
    }
  }
}

// Initialize data load
document.addEventListener("DOMContentLoaded", loadTeamData);
