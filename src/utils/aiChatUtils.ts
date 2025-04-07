
// Export all chat utilities from this central file
// This file serves as a facade for backwards compatibility

import { Message } from "./chat/types";
import { fetchUserProfile } from "./chat/profileUtils";
import { detectLanguage } from "./chat/languageUtils";
import { generateResponse } from "./chat/responseGenerator";
import { getContextualEmoji } from "./chat/contextUtils";

export {
  type Message,
  fetchUserProfile,
  detectLanguage,
  generateResponse,
  getContextualEmoji
};
